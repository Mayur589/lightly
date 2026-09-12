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
			clicks INT DEFAULT 0,
			last_accessed_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		ALTER TABLE urls ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0;
		ALTER TABLE urls ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP;
	`
	_, err := pool.Exec(ctx, query)
	if err != nil {
		log.Printf("Error in Creating/Migrating Table: %v\n", err)
		return err
	}
	log.Println("Database tables initialized successfully")

	return nil
}
