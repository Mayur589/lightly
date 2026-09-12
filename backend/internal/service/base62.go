package service

import (
	"crypto/rand"
	"math/big"
)

const (
	alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	n        = 6
)

func GenerateShortCode() (string, error) {
	code := make([]byte, n)
	max := big.NewInt(int64(len(alphabet)))

	for i := range code {
		n, err := rand.Int(rand.Reader, max)
		if err != nil {
			return "", err
		}
		code[i] = alphabet[n.Int64()]
	}

	return string(code), nil
}
