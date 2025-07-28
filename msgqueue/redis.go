package msgqueue

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/ashuthe1/streamx/models"
	"github.com/redis/go-redis/v9"
)

var (
	RedisClient *redis.Client
	once        sync.Once
)

func ConnectToRedis() {
	once.Do(func() {
		addr := os.Getenv("REDIS_ADDR") // e.g. "redis-db:6379"
		RedisClient = redis.NewClient(&redis.Options{
			Addr: addr,
		})
		if _, err := RedisClient.Ping(context.Background()).Result(); err != nil {
			log.Fatalf("redis ping failed: %v", err)
		}
		log.Println("✅ Connected to Redis")
	})
}

// Publish a chat message onto the global pub/sub channel.
// Every instance will receive it, then filter by target user.
func PublishChat(chat *models.Chat) error {
	payload, err := json.Marshal(chat)
	if err != nil {
		return err
	}
	return RedisClient.Publish(context.Background(), "chat_broadcast", payload).Err()
}

// Subscribe returns a channel of raw JSON messages from Redis global channel.
func SubscribeChat(ctx context.Context) (<-chan *models.Chat, error) {
	pubsub := RedisClient.Subscribe(ctx, "chat_broadcast")
	// Wait for confirmation that subscription is created
	if _, err := pubsub.Receive(ctx); err != nil {
		return nil, err
	}

	out := make(chan *models.Chat)
	go func() {
		defer close(out)
		ch := pubsub.Channel()
		for {
			select {
			case msg, ok := <-ch:
				if !ok {
					return
				}
				var chat models.Chat
				if err := json.Unmarshal([]byte(msg.Payload), &chat); err != nil {
					log.Println("redis unmarshal error:", err)
					continue
				}
				out <- &chat
			case <-ctx.Done():
				return
			}
		}
	}()
	return out, nil
}
