# Lightly

A full-stack, high-performance link shortener built with **Go**, **PostgreSQL**, and **React + TypeScript**, designed around the tangible metaphor of a **claim ticket**.

Pasting a long URL issues a claim ticket: a short code you can hand off, with a torn stub that stays behind as your record. Recent links form your ticket spool, and click analytics act as a punch record stamped each time a ticket is redeemed.

---

## The Claim Ticket Concept

```
┌──────────────────────────────────────────────┐
│  paste a link                                │
│  ┌────────────────────────────────────────┐  │
│  │ https://github.com/mayur/pipelineguard │  │
│  └────────────────────────────────────────┘  │
│                               [ Cut ticket ] │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ tear line ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│  light.ly/x7Qz9k                             │
│  → github.com/mayur/pipelineguard            │
└──────────────────────────────────────────────┘
```

- **The Ticket Unit**: A physical ticket layout separated by a perforated tear line with border notches.
- **Stamp Animation**: A mechanical stamp-down motion when a claim stub is issued.
- **Ticket Spool**: Left-aligned spool of recent stubs with relative age (`put 4h ago`) and scanable mono click counts.
- **Punch Record**: Visual redemption history with mono punch histograms (`▁▂▃▅▇▆▄▂▁`).
- **Typography Split**:
  - `IBM Plex Mono` — Data only (short codes, timestamps, click counts, sparklines).
  - `IBM Plex Sans` — Human language (labels, buttons, empty states, system text).

---

## Features

- ⚡ **Sub-Millisecond Redirection**: Powered by Go `net/http` standard library router and PostgreSQL connection pooling (`pgxpool`).
- 🏷️ **Cryptographic Base62 Engine**: 6-character collision-resistant short codes generated via `crypto/rand`.
- 📊 **Real-Time Punch Analytics**: Automatically tracks total visits, creation dates, and last redemption timestamps.
- 📱 **Monochrome QR Tickets**: Instant QR code generation on `<canvas>` with one-click PNG download.
- 🌐 **Custom Domain Ready**: Reads `BASE_URL` from the environment with dynamic fallback to incoming request host headers.
- 🔓 **Native CORS Middleware**: Frontend talks directly to the Go backend with zero dev server proxies required.
- 🐳 **Containerized Stack**: Multi-stage lightweight Dockerfiles for both backend and frontend.

---

## Project Structure

```text
lightly/
├── backend/                  # Go HTTP API
│   ├── cmd/server/main.go    # Server entrypoint (PORT, CORS, graceful shutdown)
│   ├── internal/
│   │   ├── database/         # Postgres pool, table migrations & click queries
│   │   ├── handler/          # Shorten, Redirect, Analytics, Health & CORS
│   │   ├── model/            # Request & response data transfer models
│   │   └── service/          # Base62 encoder & URL validator
│   ├── Dockerfile            # Minimal Alpine Go binary container (~15MB)
│   ├── fly.toml              # Fly.io deployment configuration
│   ├── go.mod & go.sum
│   └── .env.example
├── frontend/                 # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/       # TicketUnit, TicketSpool, PunchRecord, PaperQRModal
│   │   ├── services/api.ts   # Direct CORS API client
│   │   ├── App.tsx & App.css # Claim ticket layout & stamp animation
│   │   ├── index.css         # Claim ticket design tokens & typography
│   │   └── main.tsx
│   ├── Dockerfile            # Multi-stage Nginx container
│   ├── nginx.conf            # SPA routing configuration
│   └── package.json
├── docker-compose.yml        # PostgreSQL + Go Backend + Nginx Frontend
├── Makefile                  # Workflow automation
├── .env.example              # Root environment template
└── README.md
```

---

## Running the Project

### Using Make

The root `Makefile` includes shortcuts for all common development and testing tasks:

```bash
# First-time setup (installs Go modules and NPM dependencies)
make install

# Start a local PostgreSQL container on port 5432
make db

# Run both backend (:8000) and frontend (:5173) concurrently
make dev
```

| Target | Description |
|---|---|
| `make dev` | Run backend and frontend concurrently |
| `make dev-backend` | Run only the Go API server |
| `make dev-frontend` | Run only the Vite React dev server |
| `make db` | Start a standalone PostgreSQL container on port 5432 |
| `make test` | Run backend unit tests (`go test -v ./...`) |
| `make build` | Compile Go binary and build frontend production bundle |
| `make up` | Start the full multi-container stack with Docker Compose |
| `make down` | Stop all Docker Compose containers |
| `make clean` | Remove compiled binaries and build artifacts |
| `make help` | Show all available commands |

---

### Using Docker Compose

To spin up the entire stack (PostgreSQL, Go backend, and Nginx frontend) in isolated containers:

```bash
docker compose up --build
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## Environment Variables

| Variable | Target | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/lightly?sslmode=disable` |
| `BASE_URL` | Backend | Public domain prefix for shortened links | `http://localhost:8000` or `https://light.ly` |
| `PORT` | Backend | Port Go HTTP server listens on | `8000` |
| `VITE_API_URL` | Frontend | Target URL for frontend API calls | `http://localhost:8000` |

---

## API Reference

### 1. Health Check
```http
GET /health
```
```json
{
  "status": "healthy",
  "service": "lightly-api"
}
```

### 2. Cut a Ticket (Shorten URL)
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://github.com/golang/go"
}
```
Response (`201 Created`):
```json
{
  "success": true,
  "shortCode": "7aB9kX",
  "shortURL": "http://localhost:8000/7aB9kX"
}
```

### 3. Redeem Ticket (Redirection)
```http
GET /{code}
```
- Status: `302 Found`
- Header: `Location: <originalURL>`
- Asynchronously increments click count in PostgreSQL.

### 4. Ticket Punch Record (Analytics)
```http
GET /api/stats/{code}
```
Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "shortCode": "7aB9kX",
    "originalURL": "https://github.com/golang/go",
    "clicks": 42,
    "createdAt": "2026-09-13T00:15:00Z",
    "lastAccessedAt": "2026-09-13T00:40:00Z"
  }
}
```

### 5. Ticket Spool (Recent)
```http
GET /api/recent?limit=15
```
Response (`200 OK`):
```json
{
  "success": true,
  "data": [ ... ]
}
```

---

## Testing

Run unit tests for URL validation and Base62 shortcode generation:
```bash
make test
```
