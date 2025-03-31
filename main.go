package main

import (
	"log"
	"sync"

	"github.com/ashuthe1/streamx/chatbot"
	"github.com/ashuthe1/streamx/database"
	"github.com/ashuthe1/streamx/httpserver"
	"github.com/ashuthe1/streamx/kafka"
	"github.com/ashuthe1/streamx/ws"
)

func main() {
	database.Connect()

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		// Decrement the counter when this goroutine completes
		defer wg.Done()
		ws.StartWebSocketServer()
	}()

	go func() {
		// Decrement the counter when this goroutine completes
		defer wg.Done()
		httpserver.StartHttpServer()
	}()

	go func() {
		defer wg.Done()
		kafka.StartKafkaConsumer()
	}()

	go chatbot.CreateChatBotUser()

	// go func() {
	// 	defer wg.Done()
	// 	upload.SetupFileUpload()
	// }()

	// Wait for both goroutines to complete
	wg.Wait()

	log.Println("Both servers , kafka, fileUploadConsumer have been started and are running concurrently.")
}
