package main

import (
	"fmt"
	"lightly/internal/database"
	"lightly/internal/handler"

	"log"
	"net/http"
)

func main() {
	// connect database

	pool, err := database.Connect()
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer pool.Close()

	fmt.Println("Successfully connected to PostgreSQL!")

	mux := http.NewServeMux()
	handler.HandleRoutes(mux)
	log.Println("Server starting on port 8000...")
	server_err := http.ListenAndServe(":8000", mux)
	if server_err != nil {
		log.Fatal("Error in starting server:", server_err)
	}

}
