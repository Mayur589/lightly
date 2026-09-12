package handler

import (
	"context"
	"encoding/json"
	"lightly/internal/database"
	"lightly/internal/model"
	"log"
	"net/http"
	"time"
)

func (h *Handler) RedirectHandler(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")
	if code == "" {
		http.NotFound(w, r)
		return
	}

	ctx := r.Context()

	exists, err := database.IsShortCodeInDB(code, ctx, h.DB)
	if err != nil {
		log.Println("Database error checking shortcode:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.RedirectResponse{
			Success: false,
			Error:   "Internal server error",
		})
		return
	}

	if !exists {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(model.RedirectResponse{
			Success: false,
			Error:   "Short link not found",
		})
		return
	}

	originalURL, err := database.GetOriginalURL(code, ctx, h.DB)
	if err != nil {
		log.Println("Database error retrieving original URL:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(model.RedirectResponse{
			Success: false,
			Error:   "Failed to retrieve destination link",
		})
		return
	}

	// Increment clicks asynchronously
	go func(c string) {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = database.IncrementClicks(c, bgCtx, h.DB)
	}(code)

	http.Redirect(w, r, originalURL, http.StatusFound)
}
