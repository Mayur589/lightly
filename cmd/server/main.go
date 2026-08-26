package main

import (
	"lightly/internal/handler"
	"log"
	"net/http"
)

func main() {
	// connect database

	mux := http.NewServeMux()
	handler.HandleRoutes(mux)
	log.Println("Server starting on port 8000...")
	server_err := http.ListenAndServe(":8000", mux)
	if server_err != nil {
		log.Fatal("Error in starting server:", server_err)
	}

}
