package handler

import (
	"encoding/json"
	"lightly/internal/database"
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
	var code string
	ctx := r.Context()

	for {
		code, err = service.GenerateShortCode()
		if err != nil {
			log.Println("Error: ", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		exits, err := database.IsShortCodeInDB(code, ctx, h.DB)
		if err != nil {
			log.Println("Error: ", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		if !exits {
			break
		}

	}
	log.Println("Short Code: ", code)

	// Add the url and short code in the database
	err = database.AddURL(parsed_url.String(), code, ctx, h.DB)
	if err != nil {
		log.Println("Error:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
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
