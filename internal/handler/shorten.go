package handler

import (
	"encoding/json"
	"fmt"
	"lightly/internal/model"
	"lightly/internal/service"
	"net/http"
)

func ShortenHandler(w http.ResponseWriter, r *http.Request) {
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

	fmt.Println(parsed_url)

}
