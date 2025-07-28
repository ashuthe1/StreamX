package msgqueue

import (
	"context"
	"encoding/json"
	"log"

	"github.com/ashuthe1/streamx/internal/redisclient"
	"github.com/ashuthe1/streamx/models"
)

// PublishChat publishes a chat message onto the global pub/sub channel.
// Every instance will receive it, then filter by target user.
func PublishChat(chat *models.Chat) error {
	payload, err := json.Marshal(chat)
	if err != nil {
		return err
	}
	return redisclient.Client.Publish(context.Background(), "chat_broadcast", payload).Err()
}

// SubscribeChat returns a channel of *models.Chat coming from Redis.
// Call redisclient.Init() early in your startup (e.g. in main or init) to ensure Client is ready.
func SubscribeChat(ctx context.Context) (<-chan *models.Chat, error) {
	pubsub := redisclient.Client.Subscribe(ctx, "chat_broadcast")
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
