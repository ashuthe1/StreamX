package kyber

// import (
// 	"crypto/rand"
// 	"fmt"

// 	"github.com/cloudflare/circl/kem/kyber/kyber768"
// )

// // GenerateKeyPair creates a new Kyber key pair
// func GenerateKeyPair() (*KeyPair, error) {
// 	// Generate key pair using crypto/rand
// 	publicKey, privateKey, err := kyber768.GenerateKeyPair(rand.Reader)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to generate key pair: %w", err)
// 	}

// 	return &KeyPair{
// 		PrivateKey: privateKey,
// 		PublicKey:  publicKey,
// 	}, nil
// }
