# UdaanSetu — Deployment & Operations Guide

---

## 1. Cloud Architecture Overview

UdaanSetu is designed for cloud-native deployment with decoupled frontend and backend services:
- **Backend API & ML Engine**: Deployed on **Render** using Blueprint Infrastructure-as-Code (`render.yaml`).
- **Frontend SPA / SSR**: Deployed on **Vercel** or containerized via Docker.
- **Database**: Managed PostgreSQL on Render or AWS RDS.

---

## 2. Render Deployment (`render.yaml`)

The repository includes a production-ready Render Blueprint specification:

```yaml
services:
  - type: web
    name: udaansetu-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: udaansetu-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: OLLAMA_ENABLED
        value: "false"
      - key: CORS_ORIGINS
        value: https://udaansetu.vercel.app
  - type: pgsql
    name: udaansetu-db
    plan: free
    databaseName: udaansetu
    user: udaansetu
```

---

## 3. Docker Compose Local & Production Setup

### 3.1 Local Development
```bash
docker compose up --build
```
- Starts PostgreSQL container on port `5432`
- Starts FastAPI backend on port `8000`
- Starts Next.js frontend on port `3000`

### 3.2 Production Deployment
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 4. Environment Configuration (`.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL Connection URI | `postgresql+psycopg://user:pass@host:5432/udaansetu` |
| `SECRET_KEY` | Cryptographic secret for JWT | Generated random 64-char string |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,https://udaansetu.vercel.app` |
| `JWT_EXPIRY_HOURS` | Session lifespan in hours | `12` |
| `MAX_UPLOAD_BYTES` | Maximum upload size in bytes | `10485760` (10 MB) |
| `RATE_LIMIT_PER_MINUTE`| Rate limit requests per client | `120` |

---

## 5. Health Check & Observability Verification

- **Unauthenticated Health Route**: `GET /health` returns `{"status": "ok", "version": "0.2.0"}` with HTTP 200.
- This prevents Render/AWS load balancers from failing health checks due to missing authentication tokens.
