package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"sync"
	"time"

	"github.com/ashuthe1/streamx/channels"
	"github.com/ashuthe1/streamx/chatbot"
	"github.com/ashuthe1/streamx/kafka"
	"github.com/ashuthe1/streamx/models"
	"github.com/ashuthe1/streamx/msgqueue"
	"github.com/ashuthe1/streamx/online"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

type Client struct {
	Conn                *websocket.Conn
	Username            string
	cancel              context.CancelFunc
	DialogFlowSessionID string
}

type Message struct {
	Type string      `json:"type"`
	User string      `json:"user,omitempty"`
	Chat models.Chat `json:"chat,omitempty"`
}

// track active WebSocket clients
var clients = struct {
	sync.Mutex
	m map[*Client]bool
}{m: make(map[*Client]bool)}

var presence PresenceService

func init() {
	onlineUsers := map[string]bool{}
	presence = PresenceService{onlineUsers: onlineUsers, mu: &sync.Mutex{}}
}

// ServeWS upgrades HTTP request to WebSocket and tracks the client
func ServeWS(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		c.Locals("allowed", true)
		return websocket.New(func(conn *websocket.Conn) {
			ctx, cancel := context.WithCancel(context.Background())
			client := &Client{
				Conn:                conn,
				cancel:              cancel,
				DialogFlowSessionID: generateSessionID(),
			}

			clients.Lock()
			clients.m[client] = true
			clients.Unlock()

			defer func() {
				presence.setUserOffline(client.Username)
				if err := online.DeleteUserFromRedis(client.Username); err != nil {
					log.Printf("error deleting user %s: %v", client.Username, err)
				}
				cancel()
				if client.Username != "" {
					logout := models.ActivityEvent{
						Type:      kafka.ActivityMsgType,
						Username:  client.Username,
						Action:    "log out",
						Timestamp: time.Now().Unix(),
						Details:   fmt.Sprintf("User %s logged out", client.Username),
					}
					if err := kafka.ProduceEventToKafka(kafka.ActivityTopic, logout); err != nil {
						log.Printf("error producing logout activity: %v", err)
					}
				}
				clients.Lock()
				delete(clients.m, client)
				clients.Unlock()
			}()

			receiveMessages(ctx, client)
		})(c)
	}
	return fiber.ErrUpgradeRequired
}

// receiveMessages handles incoming WebSocket frames
func receiveMessages(ctx context.Context, client *Client) {
	for {
		_, p, err := client.Conn.ReadMessage()
		if err != nil {
			return
		}
		var m Message
		if err := json.Unmarshal(p, &m); err != nil {
			log.Println("unmarshal error:", err)
			continue
		}

		switch m.Type {
		case "bootup":
			client.Username = m.User
			presence.setUserOnline(client.Username)
			if err := online.AddUserToRedis(client.Username); err != nil {
				log.Println("redis add user error:", err)
			}
			// welcome notification
			welcome := models.Notification{
				Type:     kafka.NotificationMsgType,
				Username: client.Username,
				Message:  "Welcome to the chat!",
			}
			kafka.ProduceEventToKafka(kafka.NotificationTopic, welcome)
			// login activity
			loginAct := models.ActivityEvent{
				Type:      kafka.ActivityMsgType,
				Username:  client.Username,
				Action:    "login",
				Timestamp: time.Now().Unix(),
				Details:   fmt.Sprintf("User %s logged in", client.Username),
			}
			kafka.ProduceEventToKafka(kafka.ActivityTopic, loginAct)

		case "message":
			chat := m.Chat
			chat.Timestamp = time.Now().Unix()
			// persist
			kafka.ProduceEventToKafka(kafka.ChatTopic, models.ChatEvent{
				Type:    kafka.ChatMsgType,
				ChatMsg: &chat,
			})
			// if to chatbot
			if chat.To == "ChatBot" {
				resp, err := chatbot.ChatbotHandler(chat.Msg, client.DialogFlowSessionID)
				if err != nil {
					chat.Msg = "Sorry, an error occurred."
				} else {
					chat.Msg = resp
				}
				deliverToUser(chat.To, &chat) // Echo back
				kafka.ProduceEventToKafka(kafka.ChatTopic, models.ChatEvent{
					Type:    kafka.ChatMsgType,
					ChatMsg: &chat,
				})
			} else {
				// broadcast via Redis
				if err := msgqueue.PublishChat(&chat); err != nil {
					log.Println("redis publish error:", err)
				}
			}

		case "file":
			file := m.Chat
			file.Timestamp = time.Now().Unix()
			kafka.ProduceEventToKafka(kafka.FileTopic, models.ChatEvent{
				Type:    kafka.ChatMsgType,
				ChatMsg: &file,
			})

		default:
			client.Conn.WriteJSON(fmt.Sprintf("invalid msg type: %s", m.Type))
		}
	}
}

// StartWebSocketServer launches the WS server and Redis subscription
func StartWebSocketServer() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// subscribe to Redis broadcast channel
	subCh, err := msgqueue.SubscribeChat(ctx)
	if err != nil {
		log.Fatalf("redis subscribe failed: %v", err)
	}
	go func() {
		for chat := range subCh {
			deliverToUser(chat.To, chat)
		}
	}()

	// existing Kafka‑based activity notifications
	go func() {
		for act := range channels.BroadcastKafkaActivity {
			clients.Lock()
			for c := range clients.m {
				c.Conn.WriteJSON(act)
			}
			clients.Unlock()
		}
	}()

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://frontend:4000, http://localhost:4000, http://host.docker.internal:4000, http://34.93.176.4:4000, https://chat.gautamashutosh.com, https://ws.gautamashutosh.com, https://chatx.gautamashutosh.com, https://wsx.gautamashutosh.com ",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))
	// health check + WS endpoint
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":        "up",
			"server_region": os.Getenv("SERVER_NAME"),
		})
	})
	app.Get("/", func(c *fiber.Ctx) error { return ServeWS(c) })

	port := os.Getenv("WS_PORT")
	log.Printf("WS server listening on :%s\n", port)
	app.Listen(":" + port)
}

// deliverToUser sends chat or notification only to matching username
func deliverToUser(username string, chat *models.Chat) {
	clients.Lock()
	defer clients.Unlock()
	for c := range clients.m {
		if c.Username == username {
			c.Conn.WriteJSON(chat)
		}
	}
}

func generateIDNumber() int {
	return rand.Intn(10000) + 1
}

func generateSessionID() string {
	rand.Seed(time.Now().UnixNano())
	charset := "abcdefghijklmnopqrstuvwxyz12345"
	return string(charset[rand.Intn(len(charset))])
}
