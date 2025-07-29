package handler

import (
	"encoding/base64"
	"log"
	"net/http"

	"github.com/ashuthe1/streamx/database"
	"github.com/gofiber/fiber/v2"
)

type RegisterRequest struct {
	Username  string `json:"username"`
	PublicKey string `json:"public_key"` // Receive as Base64 string
}

// RegisterPublicKeyHandler registers or updates a user's public key.
func RegisterPublicKeyHandler(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("Failed to parse register public key payload: %v", err)
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"error": "Invalid request payload"})
	}

	// Decode the Base64 public key to bytes.
	publicKeyBytes, err := base64.StdEncoding.DecodeString(req.PublicKey)
	if err != nil {
		log.Printf("Failed to decode public key for user %s: %v", req.Username, err)
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"error": "Invalid public key encoding"})
	}

	// Fetch the user by username.
	user, err := GetUserByUsername(req.Username)
	if err != nil {
		log.Printf("User %s not found: %v", req.Username, err)
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{"error": "User not found"})
	}

	// Update the user's public key.
	user.PublicKey = publicKeyBytes
	// fmt.Println("user: ", user)
	if err := database.DB.Save(&user).Error; err != nil {
		log.Printf("Error saving public key for user %s: %v", req.Username, err)
		c.Status(http.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": "Failed to register public key"})
	}

	log.Printf("Public key registered for user: %s", req.Username)
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Public key registered successfully",
	})
}

// GetPublicKeyHandler fetches a user's public key based on the username query parameter.
func GetPublicKeyHandler(c *fiber.Ctx) error {
	username := c.Query("user")
	if username == "" {
		// log.Printf("Username query parameter missing")
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"error": "Username is required"})
	}

	user, err := GetUserByUsername(username)
	if err != nil {
		// log.Printf("User %s not found: %v", username, err)
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{"error": "User not found"})
	}

	if user.PublicKey == nil {
		log.Printf("Public key not set for user: %s", username)
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{"error": "Public key not found for user"})
	}

	// fmt.Println("user publicKey: ", user.PublicKey)
	// Encode the public key to Base64 before sending.
	publicKeyBase64 := base64.StdEncoding.EncodeToString(user.PublicKey)
	// fmt.Println("user, publicKeyBase64: ", publicKeyBase64)

	// log.Printf("Fetched public key for user: %s", username)
	return c.Status(http.StatusOK).JSON(fiber.Map{"publicKey": publicKeyBase64})
}
