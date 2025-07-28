package kafka

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/IBM/sarama"
)

var producer sarama.SyncProducer

// InitProducer tries up to maxRetries to connect, doubling the delay each time.
func InitProducer(brokers []string) error {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Return.Successes = true
	// we won’t rely on Sarama’s internal Retry here, we’ll do our own
	const (
		maxRetries = 7
		baseDelay  = time.Second * 2
	)

	var err error
	delay := baseDelay
	for i := 0; i < maxRetries; i++ {
		producer, err = sarama.NewSyncProducer(brokers, config)
		if err == nil {
			log.Println("✅ Connected to Kafka producer")
			return nil
		}
		log.Printf("Kafka producer init failed (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(delay)
		delay *= 2
	}
	return fmt.Errorf("could not initialize Kafka producer after %d attempts: %w", maxRetries, err)
}

// ProduceEventToKafka unchanged...
func ProduceEventToKafka(topic string, message interface{}) error {
	msgBytes, err := json.Marshal(message)
	if err != nil {
		return err
	}
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.ByteEncoder(msgBytes),
	}
	_, _, err = producer.SendMessage(msg)
	if err != nil {
		log.Println("Error sending message:", err)
		return err
	}
	log.Printf("Event produced to %s", topic)
	return nil
}
