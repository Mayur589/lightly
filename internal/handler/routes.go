package handler

import (
	"net/http"
)

func HandleRoutes(mux *http.ServeMux, h *Handler) {
	mux.HandleFunc("POST /shorten", h.ShortenHandler)
	mux.HandleFunc("GET /{code}", RedirectHandler)
}
