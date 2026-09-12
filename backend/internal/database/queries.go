package database

import (
	"context"
	"lightly/internal/model"
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
		log.Println("Error checking short code existence:", err)
		return false, err
	}

	return exists, nil
}

func GetOriginalURL(code string, ctx context.Context, pool *pgxpool.Pool) (string, error) {
	query := `
		SELECT original_url
		FROM urls
		WHERE short_code = $1
	`

	var originalURL string
	err := pool.QueryRow(ctx, query, code).Scan(&originalURL)
	if err != nil {
		log.Println("Error retrieving original URL:", err)
		return "", err
	}

	return originalURL, nil
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

func IncrementClicks(code string, ctx context.Context, pool *pgxpool.Pool) error {
	query := `
		UPDATE urls
		SET clicks = COALESCE(clicks, 0) + 1,
		    last_accessed_at = CURRENT_TIMESTAMP
		WHERE short_code = $1;
	`
	_, err := pool.Exec(ctx, query, code)
	if err != nil {
		log.Println("Error incrementing clicks:", err)
		return err
	}
	return nil
}

func GetStats(code string, ctx context.Context, pool *pgxpool.Pool) (*model.URLStats, error) {
	query := `
		SELECT short_code, original_url, COALESCE(clicks, 0), created_at, last_accessed_at
		FROM urls
		WHERE short_code = $1
	`

	var s model.URLStats
	err := pool.QueryRow(ctx, query, code).Scan(
		&s.ShortCode,
		&s.OriginalURL,
		&s.Clicks,
		&s.CreatedAt,
		&s.LastAccessedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func GetRecentURLs(limit int, ctx context.Context, pool *pgxpool.Pool) ([]model.URLStats, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	query := `
		SELECT short_code, original_url, COALESCE(clicks, 0), created_at, last_accessed_at
		FROM urls
		ORDER BY created_at DESC
		LIMIT $1
	`

	rows, err := pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.URLStats
	for rows.Next() {
		var s model.URLStats
		if err := rows.Scan(&s.ShortCode, &s.OriginalURL, &s.Clicks, &s.CreatedAt, &s.LastAccessedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}

	return list, nil
}
