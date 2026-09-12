package service

import (
	"context"
	"lightly/internal/database"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ShortenService(url string, ctx context.Context, DB *pgxpool.Pool) (string, error) {

	parsed_url, err := IsValidURL(url)
	if err != nil {
		return "", err
	}
	log.Println("URL: ", parsed_url)

	// Generate a short code till it is unique
	var code string

	for {
		code, err = GenerateShortCode()
		if err != nil {
			log.Println("Error: ", err)
			return "", err
		}

		exits, err := database.IsShortCodeInDB(code, ctx, DB)
		if err != nil {
			log.Println("Error: ", err)
			return "", err
		}

		if !exits {
			break
		}

	}
	log.Println("Short Code: ", code)

	// Add the url and short code in the database
	err = database.AddURL(parsed_url.String(), code, ctx, DB)
	if err != nil {
		log.Println("Error:", err)
		return "", err
	}

	return code, nil
}
