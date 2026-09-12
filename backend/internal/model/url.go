package model

import "time"

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	Success   bool   `json:"success"`
	ShortCode string `json:"shortCode,omitempty"`
	ShortURL  string `json:"shortURL,omitempty"`
	Error     string `json:"error,omitempty"`
}

type RedirectResponse struct {
	Success     bool   `json:"success"`
	OriginalURL string `json:"originalURL,omitempty"`
	Error       string `json:"error,omitempty"`
}

type URLStats struct {
	ShortCode      string     `json:"shortCode"`
	OriginalURL    string     `json:"originalURL"`
	Clicks         int        `json:"clicks"`
	CreatedAt      time.Time  `json:"createdAt"`
	LastAccessedAt *time.Time `json:"lastAccessedAt"`
}
