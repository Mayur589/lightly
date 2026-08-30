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
