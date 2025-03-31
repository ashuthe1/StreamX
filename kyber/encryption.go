package kyber

// import (
// 	"crypto/aes"
// 	"crypto/cipher"
// 	"crypto/rand"
// 	"encoding/base64"
// 	"fmt"
// 	"io"

// 	"github.com/cloudflare/circl/kem/kyber/kyber768"
// )

// // EncryptMessage encrypts a message using AES-GCM and Kyber
// func EncryptMessage(message string, recipientPubKey *kyber768.PublicKey) (*Message, error) {
// 	// Prepare buffers for ciphertext and shared secret
// 	ct := make([]byte, kyber768.CiphertextSize)
// 	ss := make([]byte, kyber768.SharedKeySize)

// 	// Generate random seed for encapsulation
// 	seed := make([]byte, kyber768.EncapsulationSeedSize)
// 	if _, err := io.ReadFull(rand.Reader, seed); err != nil {
// 		return nil, fmt.Errorf("failed to generate seed: %w", err)
// 	}

// 	// Encapsulate shared secret
// 	recipientPubKey.EncapsulateTo(ct, ss, seed)

// 	// Use the shared secret as AES key
// 	block, err := aes.NewCipher(ss)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create AES cipher: %w", err)
// 	}

// 	// Create GCM mode
// 	gcm, err := cipher.NewGCM(block)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create GCM: %w", err)
// 	}

// 	// Generate nonce
// 	nonce := make([]byte, gcm.NonceSize())
// 	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
// 		return nil, fmt.Errorf("failed to generate nonce: %w", err)
// 	}

// 	// Encrypt the message
// 	encryptedContent := gcm.Seal(nil, nonce, []byte(message), nil)

// 	return &Message{
// 		Content:      base64.StdEncoding.EncodeToString(encryptedContent),
// 		EncryptedKey: ct,
// 		Nonce:        nonce,
// 	}, nil
// }
