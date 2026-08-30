package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateTable(ctx context.Context, pool *pgxpool.Pool) error {
	query := `
		CREATE TABLE IF NOT EXISTS urls (
			id SERIAL PRIMARY KEY,
			short_code VARCHAR(10) UNIQUE NOT NULL,
			original_url TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)

	`
	_, err := pool.Exec(ctx, query)
	if err != nil {
		log.Fatal("Error in Creating Table", err)
		return err
	}
	log.Println("Table Created Successfully")

	return nil
}
