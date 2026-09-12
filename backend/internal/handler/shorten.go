package handler

import (
	"encoding/json"
	"lightly/internal/model"
	"lightly/internal/service"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}

func (h *Handler) ShortenHandler(w http.ResponseWriter, r *http.Request) {
	var req model.ShortenRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ShortenResponse{
			Success: false,
			Error:   "Invalid JSON payload",
		})
		return
	}

	url := strings.TrimSpace(req.URL)
	if url == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ShortenResponse{
			Success: false,
			Error:   "URL cannot be empty",
		})
		return
	}

	parsedURL, err := service.IsValidURL(url)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(model.ShortenResponse{
			Success: false,
			Error:   "Invalid URL format: " + err.Error(),
		})
		return
	}
	log.Println("Parsed URL:", parsedURL)

	ctx := r.Context()
	code, err := service.ShortenService(url, ctx, h.DB)
	if err != nil {
		log.Printf("ShortenService error: %v", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.ShortenResponse{
			Success: false,
			Error:   "Failed to generate short link",
		})
		return
	}

	// Resolve base URL: BASE_URL env var > request scheme + host > default
	baseURL := strings.TrimSpace(os.Getenv("BASE_URL"))
	if baseURL == "" {
		scheme := "http"
		if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
			scheme = "https"
		}
		baseURL = scheme + "://" + r.Host
	}
	baseURL = strings.TrimRight(baseURL, "/")

	response := model.ShortenResponse{
		Success:   true,
		ShortCode: code,
		ShortURL:  baseURL + "/" + code,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}
