package handler

import (
	"encoding/json"
	"lightly/internal/database"
	"lightly/internal/model"
	"log"
	"net/http"
)

func (h *Handler) RedirectHandler(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	ctx := r.Context()

	exits, err := database.IsShortCodeInDB(code, ctx, h.DB)
	if err != nil {
		log.Println("Error: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if !exits {
		response := model.RedirectResponse{
			Success: false,
			Error:   "Short Link does not exists",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	orginial_url, err := database.GetOrginalUrl(code, ctx, h.DB)
	if err != nil {
		log.Println("Error: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, orginial_url, http.StatusFound)

}
