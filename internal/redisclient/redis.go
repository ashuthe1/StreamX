package redisclient

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

func Init() {
	addr := os.Getenv("REDIS_ADDR")
	Client = redis.NewClient(&redis.Options{Addr: addr})
	if _, err := Client.Ping(context.Background()).Result(); err != nil {
		log.Fatalf("redis ping failed: %v", err)
	} else {
		log.Println("Connected to Redis!")
	}
}
