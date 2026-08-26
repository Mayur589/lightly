package handler

import (
	"net/http"
)

func HandleRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /shorten", ShortenHandler)
	mux.HandleFunc("GET /{code}", RedirectHandler)
}
