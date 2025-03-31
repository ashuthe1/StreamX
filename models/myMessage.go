package models

type MyMessage struct {
	Id               uint   `json:"id"`
	From             string `json:"from"`
	To               string `json:"to"`
	Msg              string `json:"message,omitempty"`           // Plain text message (if available)
	EncryptedMessage []byte `json:"encrypted_message,omitempty"` // Ciphertext bytes (automatically Base64-encoded in JSON)
	EncapsulatedKey  []byte `json:"encapsulated_key,omitempty"`  // Encapsulated key bytes
	IV               []byte `json:"iv,omitempty"`                // Initialization vector for AES-GCM
	Timestamp        int64  `json:"timestamp,omitempty"`
}
