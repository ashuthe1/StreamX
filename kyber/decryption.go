package kyber

// import (
// 	"crypto/aes"
// 	"crypto/cipher"
// 	"encoding/base64"
// 	"fmt"

// 	"github.com/cloudflare/circl/kem/kyber/kyber768"
// )

// // DecryptMessage decrypts a message using the recipient's private key
// func DecryptMessage(msg *Message, privateKey *kyber768.PrivateKey) (string, error) {
// 	// Prepare buffer for shared secret
// 	ss := make([]byte, kyber768.SharedKeySize)

// 	// Decapsulate shared secret
// 	privateKey.DecapsulateTo(ss, msg.EncryptedKey)

// 	// Create AES cipher using the shared secret
// 	block, err := aes.NewCipher(ss)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to create AES cipher: %w", err)
// 	}

// 	// Create GCM mode
// 	gcm, err := cipher.NewGCM(block)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to create GCM: %w", err)
// 	}

// 	// Decode base64 content
// 	encryptedContent, err := base64.StdEncoding.DecodeString(msg.Content)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to decode base64: %w", err)
// 	}

// 	// Decrypt the message
// 	plaintext, err := gcm.Open(nil, msg.Nonce, encryptedContent, nil)
// 	if err != nil {
// 		return "", fmt.Errorf("failed to decrypt message: %w", err)
// 	}

// 	return string(plaintext), nil
// }
