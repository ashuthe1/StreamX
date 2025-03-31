package msgqueue

import (
	"encoding/json"
	"log"

	"github.com/ashuthe1/streamx/models"
	amqp "github.com/rabbitmq/amqp091-go"
)

// Publish publishes a chat message to RabbitMQ.
func Publish(queueName string, chat *models.Chat) error {
	connLock.Lock()
	defer connLock.Unlock()

	_, err := RabbitChannel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
		return err
	}

	message, err := json.Marshal(chat)
	if err != nil {
		log.Println("Failed to marshal chat")
		return err
	}

	err = RabbitChannel.Publish(
		"",
		queueName,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)
	if err != nil {
		log.Println("Error publishing to channel")
		return err
	}

	log.Printf("Published message successfully: %v", chat)
	return nil
}

func Consume(queueName string) (<-chan amqp.Delivery, error) {
	connLock.Lock()
	defer connLock.Unlock()

	log.Printf("Consuming messages for queue: %s", queueName)
	_, err := RabbitChannel.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Println("Error declaring queue:", err.Error())
		return nil, err
	}

	return RabbitChannel.Consume(
		queueName,
		"",
		false, // auto-ack off
		false,
		false,
		false,
		nil,
	)
}
