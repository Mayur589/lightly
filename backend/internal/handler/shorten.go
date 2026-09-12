package handler

import (
	"encoding/json"
	"lightly/internal/model"
	"lightly/internal/service"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	DB *pgxpool.Pool
}

func (h *Handler) ShortenHandler(w http.ResponseWriter, r *http.Request) {
	var req model.ShortenRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	url := req.URL

	parsed_url, err := service.IsValidURL(url)
	if err != nil {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	log.Println("URL: ", parsed_url)

	// Generate a short code till it is unique
	ctx := r.Context()

	code, err := service.ShortenService(url, ctx, h.DB)
	if err != nil {
		http.Error(w, "Internal Server Errror", http.StatusInternalServerError)
	}

	// return the shortcode
	response := model.ShortenResponse{
		Success:  true,
		ShortURL: "http://localhost:8000/" + code,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)

	json.NewEncoder(w).Encode(response)
}
