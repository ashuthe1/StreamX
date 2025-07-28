package database

import (
	"log"
	"os"
	"time"

	"github.com/ashuthe1/streamx/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	// load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file:", err)
	}
	dsn := os.Getenv("DSN")
	if dsn == "" {
		log.Fatal("DSN env var is empty")
	}

	const (
		maxRetries = 7
		baseDelay  = 2 * time.Second
	)

	var db *gorm.DB
	var err error
	delay := baseDelay

	for i := 1; i <= maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			// Optional: suppress GORM's verbose logger
			Logger: logger.Default.LogMode(logger.Silent),
		})
		if err == nil {
			sqlDB, errPing := db.DB()
			if errPing == nil {
				// ping to ensure database is really up
				if pingErr := sqlDB.Ping(); pingErr == nil {
					log.Println("✅ Connected to Postgres on attempt", i)
					break
				} else {
					err = pingErr
				}
			} else {
				err = errPing
			}
		}

		log.Printf("Postgres connect attempt %d/%d failed: %v", i, maxRetries, err)
		if i == maxRetries {
			log.Fatal("🚨 Could not connect to the database after retries:", err)
		}
		time.Sleep(delay)
		delay *= 2
	}

	DB = db

	log.Println("🔄 Running AutoMigrate...")
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Chat{},
		&models.ContactList{},
		&models.ActivityEvent{},
		&models.MyMessage{},
	); err != nil {
		log.Fatal("AutoMigrate failed:", err)
	}
	log.Println("✅ Database migrated and ready")
}
