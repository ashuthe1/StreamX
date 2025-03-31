package models

type Chat struct {
	Id               uint   `json:"id"`
	From             string `json:"from"`
	To               string `json:"to"`
	Msg              string `json:"message,omitempty"`           // Plain text message (if available)
	EncryptedMessage []byte `json:"encrypted_message,omitempty"` // Ciphertext bytes (automatically Base64-encoded in JSON)
	EncapsulatedKey  []byte `json:"encapsulated_key,omitempty"`  // Encapsulated key bytes
	IV               []byte `json:"iv,omitempty"`                // Initialization vector for AES-GCM
	FileURL          string `json:"file_url,omitempty"`
	FileName         string `json:"file_name,omitempty"`
	FileSize         int64  `json:"file_size,omitempty"`
	FileType         string `json:"file_type,omitempty"`
	Timestamp        int64  `json:"timestamp,omitempty"`
}

type ContactList struct {
	Username     string `json:"username"`
	LastActivity int64  `json:"last_activity"`
}
