package kyber

// import (
// 	"fmt"
// 	"log"

// 	"github.com/cloudflare/circl/kem/kyber/kyber768"
// )

// func test() {
// 	// Generate Kyber key pairs for two users
// 	alice, err := GenerateKeyPair()
// 	if err != nil {
// 		log.Fatal("Failed to generate Alice's key pair:", err)
// 	}

// 	println("Alice: ", alice)
// 	bob, err := GenerateKeyPair()
// 	if err != nil {
// 		log.Fatal("Failed to generate Bob's key pair:", err)
// 	}

// 	// Test message
// 	originalMessage := "Hello, this is a quantum-resistant secure message!"
// 	originalMessage2 := "Hehe Project is completed!"
// 	fmt.Printf("Original message: %s\n", originalMessage)

// 	// Alice encrypts a message for Bob
// 	encryptedMsg, err := EncryptMessage(originalMessage, bob.PublicKey)
// 	if err != nil {
// 		log.Fatal("Failed to encrypt message:", err)
// 	}

// 	encryptedMsg2, err2 := EncryptMessage(originalMessage2, bob.PublicKey)
// 	if err2 != nil {
// 		log.Fatal("Failed to encrypt message:", err)
// 	}
// 	fmt.Println("Encrypted Message2: ", encryptedMsg2.EncryptedKey)

// 	fmt.Println("Encrypted Message: ", encryptedMsg.EncryptedKey)

// 	// Bob decrypts the message
// 	decryptedMessage, err := DecryptMessage(encryptedMsg, bob.PrivateKey)
// 	if err != nil {
// 		log.Fatal("Failed to decrypt message:", err)
// 	}

// 	fmt.Printf("Decrypted message: %s\n", decryptedMessage)

// 	// Print key sizes information
// 	fmt.Printf("\nKyber768 Parameters:\n")
// 	fmt.Printf("Public Key Size: %d bytes\n", kyber768.PublicKeySize)
// 	fmt.Printf("Private Key Size: %d bytes\n", kyber768.PrivateKeySize)
// 	fmt.Printf("Ciphertext Size: %d bytes\n", kyber768.CiphertextSize)
// 	fmt.Printf("Shared Key Size: %d bytes\n", kyber768.SharedKeySize)
// }
