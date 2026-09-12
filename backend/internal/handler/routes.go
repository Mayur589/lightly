package handler

import (
	"net/http"
)

func HandleRoutes(mux *http.ServeMux, h *Handler) {
	// Health check
	mux.HandleFunc("GET /health", HealthHandler)

	// URL shortening
	mux.HandleFunc("POST /shorten", h.ShortenHandler)
	mux.HandleFunc("POST /api/shorten", h.ShortenHandler)

	// Analytics
	mux.HandleFunc("GET /api/stats/{code}", h.StatsHandler)
	mux.HandleFunc("GET /api/recent", h.RecentHandler)

	// Redirect short code (keep this at bottom or specific path value)
	mux.HandleFunc("GET /{code}", h.RedirectHandler)
}
