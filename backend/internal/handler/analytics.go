package handler

import (
	"encoding/json"
	"lightly/internal/database"
	"lightly/internal/model"
	"log"
	"net/http"
	"strconv"
)

// StatsHandler returns analytics for a single short code
func (h *Handler) StatsHandler(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")
	if code == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Short code required",
		})
		return
	}

	ctx := r.Context()
	stats, err := database.GetStats(code, ctx, h.DB)
	if err != nil {
		log.Printf("Stats error for code %s: %v\n", code, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Short code not found",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"data":    stats,
	})
}

// RecentHandler returns the latest shortened URLs
func (h *Handler) RecentHandler(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 10
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	ctx := r.Context()
	recent, err := database.GetRecentURLs(limit, ctx, h.DB)
	if err != nil {
		log.Println("Error fetching recent URLs:", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"error":   "Failed to fetch recent links",
		})
		return
	}

	if recent == nil {
		recent = []model.URLStats{}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"data":    recent,
	})
}

// HealthHandler returns uptime status
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"status":  "healthy",
		"service": "lightly-api",
	})
}
