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
		log.Fatal("Error: ", err)
		return true, err
	}

	return exists, nil
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
