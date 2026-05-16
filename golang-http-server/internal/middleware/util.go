package middleware

import (
	"crypto/rand"
	"encoding/hex"
)

func randomString(length int) string {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "unknown"
	}
	return hex.EncodeToString(b)
}
