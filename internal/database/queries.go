package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func IsShortCodeInDB(code string, ctx context.Context, pool *pgxpool.Pool) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM urls
			WHERE short_code = $1
		);
	`

	var exists bool
	err := pool.QueryRow(ctx, query, code).Scan(&exists)
	if err != nil {
		log.Println("Error: ", err)
		return true, err
	}

	return exists, nil
}

func GetOrginalUrl(code string, ctx context.Context, pool *pgxpool.Pool) (string, error) {
	query := `
		SELECT original_url
		FROM urls
		WHERE short_code = $1
	`

	var orginal_url string
	err := pool.QueryRow(ctx, query, code).Scan(&orginal_url)
	if err != nil {
		log.Println("Error: ", err)
		return "", err
	}

	return orginal_url, nil
}

func AddURL(original_url string, short_code string, ctx context.Context, pool *pgxpool.Pool) error {
	query := `
		INSERT INTO urls (short_code, original_url)
		VALUES ($1, $2);
	`

	_, err := pool.Exec(ctx, query, short_code, original_url)
	if err != nil {
		return err
	}
	return nil
}
