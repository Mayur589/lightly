.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

.PHONY: help install dev dev-backend dev-frontend db test build up down logs clean env

help: ## Show this help menu
	@echo ""
	@echo "  $(CYAN)Lightly$(RESET) — Full-Stack Link Shortener"
	@echo ""
	@echo "  $(YELLOW)Usage:$(RESET) make [target]"
	@echo ""
	@echo "  $(YELLOW)Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    $(GREEN)%-16s$(RESET) %s\n", $$1, $$2}'
	@echo ""

env: ## Ensure .env files are created from .env.example
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created root .env"; fi
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env && echo "Created backend/.env"; fi

install: env ## Install backend and frontend dependencies
	@echo "$(CYAN)--> Installing backend Go modules...$(RESET)"
	cd backend && go mod download
	@echo "$(CYAN)--> Installing frontend NPM packages...$(RESET)"
	cd frontend && npm install
	@echo "$(GREEN)--> Dependencies installed successfully!$(RESET)"

db: ## Start a standalone PostgreSQL container for local development
	@echo "$(CYAN)--> Starting PostgreSQL on port 5432...$(RESET)"
	docker run -d --name lightly-db \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=postgrespassword \
		-e POSTGRES_DB=lightly \
		-p 5432:5432 \
		postgres:16-alpine || docker start lightly-db
	@echo "$(GREEN)--> PostgreSQL is running on localhost:5432$(RESET)"

dev-backend: env ## Run the Go backend server (port 8000)
	@echo "$(CYAN)--> Starting Go backend on http://localhost:8000...$(RESET)"
	cd backend && go run cmd/server/main.go

dev-frontend: ## Run the React frontend dev server (port 5173)
	@echo "$(CYAN)--> Starting Vite frontend on http://localhost:5173...$(RESET)"
	cd frontend && npm run dev

dev: env ## Run both backend and frontend concurrently for local dev
	@echo "$(CYAN)--> Starting Lightly Full Stack in development mode...$(RESET)"
	@echo "$(YELLOW)Backend:  http://localhost:8000$(RESET)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(RESET)"
	@trap 'kill 0' EXIT; \
	(cd backend && go run cmd/server/main.go) & \
	(cd frontend && npm run dev) & \
	wait

build: env ## Build both backend binary and frontend static bundle
	@echo "$(CYAN)--> Building Go backend...$(RESET)"
	cd backend && go build -o lightly cmd/server/main.go
	@echo "$(CYAN)--> Building frontend bundle...$(RESET)"
	cd frontend && npm run build
	@echo "$(GREEN)--> Build complete!$(RESET)"

test: ## Run backend unit tests
	@echo "$(CYAN)--> Running Go unit tests...$(RESET)"
	cd backend && go test -v ./...

up: env ## Spin up full stack using Docker Compose (DB + Backend + Frontend)
	@echo "$(CYAN)--> Starting Docker Compose stack...$(RESET)"
	docker compose up --build

down: ## Stop and remove all Docker Compose containers
	@echo "$(CYAN)--> Stopping Docker Compose stack...$(RESET)"
	docker compose down

logs: ## Tail logs from Docker Compose containers
	docker compose logs -f

clean: ## Clean up compiled binaries and build artifacts
	@echo "$(CYAN)--> Cleaning build artifacts...$(RESET)"
	rm -f backend/lightly
	rm -rf frontend/dist
	@echo "$(GREEN)--> Clean complete!$(RESET)"
