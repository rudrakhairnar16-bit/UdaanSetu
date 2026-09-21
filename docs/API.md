# UdaanSetu — API Reference & Endpoint Matrix
**Version**: 0.2.0  
**Base URL**: `/api/v1` or `/` depending on deployment proxy  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Authentication & Session Endpoints

| Method | Endpoint | Description | Roles Allowed | Status Codes |
|---|---|---|---|---|
| `POST` | `/auth/login` | Authenticate user and issue JWT token | Public | `200`, `401`, `422` |
| `GET` | `/auth/me` | Retrieve authenticated user profile | Authenticated | `200`, `401` |
| `POST` | `/auth/logout` | Invalidate current session | Authenticated | `200`, `401` |
| `GET` | `/auth/users` | List registered system users | `admin` | `200`, `403` |

---

## 2. Innovation & Record Management

| Method | Endpoint | Description | Roles Allowed | Status Codes |
|---|---|---|---|---|
| `GET` | `/records` | Paginated search across records (kind, district, sector) | Authenticated | `200`, `401` |
| `GET` | `/records/{id}` | Retrieve individual record with metadata | Authenticated | `200`, `404` |
| `POST` | `/records` | Create new record (`research`, `innovation`, `ipr`, `startup`) | Authenticated | `201`, `400`, `422` |
| `PUT` | `/records/{id}` | Update record details and trigger audit notifications | Owner / `admin` | `200`, `403`, `404` |
| `DELETE` | `/records/{id}` | Remove record | `admin` | `200`, `403`, `404` |
| `GET` | `/records/export` | Export records in CSV or JSON format | Authenticated | `200`, `400` |

---

## 3. AI & Decision Support Endpoints

| Method | Endpoint | Description | Roles Allowed | Status Codes |
|---|---|---|---|---|
| `GET` | `/ai/risk/{id}` | Compute explainable project risk score | Authenticated | `200`, `404` |
| `GET` | `/ai/success/{id}` | Predict project success probability | Authenticated | `200`, `404` |
| `GET` | `/ai/similar/{id}` | Semantic similarity search across ecosystem | Authenticated | `200`, `404` |
| `GET` | `/ai/match/{id}` | Match startups or innovations to challenges | Authenticated | `200`, `404` |
| `GET` | `/ai/recommendations/{id}` | Get tailored recommendations for projects | Authenticated | `200`, `404` |
| `GET` | `/ai/duplicates/{id}` | NLP-based duplicate / overlap detection | Authenticated | `200`, `404` |
| `GET` | `/ai/metrics` | View model training metrics and parameters | `admin` | `200`, `403` |
| `POST` | `/ai/retrain` | Trigger retraining pipeline on recent data | `admin` | `200`, `403` |

---

## 4. Pilots, Procurement & Workflow

| Method | Endpoint | Description | Roles Allowed | Status Codes |
|---|---|---|---|---|
| `GET` | `/pilots` | List startup pilot implementations | Authenticated | `200` |
| `POST` | `/pilots` | Initialize pilot for challenge solution | `govt`, `procurement`, `admin` | `201`, `400` |
| `GET` | `/procurements` | List public procurement records | Authenticated | `200` |
| `POST` | `/procurements` | Award procurement based on pilot validation | `procurement`, `admin` | `201`, `400` |
| `GET` | `/purchase-orders` | List purchase orders with milestone tracking | Authenticated | `200` |
| `GET` | `/validations` | Retrieve third-party technical validations | Authenticated | `200` |
| `GET` | `/scale-ups` | List projects eligible for statewide scaling | Authenticated | `200` |

---

## 5. Audit, Notifications & Observability

| Method | Endpoint | Description | Roles Allowed | Status Codes |
|---|---|---|---|---|
| `GET` | `/health` | Unauthenticated public health check | Public | `200` |
| `GET` | `/api/v1/health` | Alias health endpoint with DB connection status | Public | `200` |
| `GET` | `/audit` | View immutable system audit trail | `admin` | `200`, `403` |
| `GET` | `/notifications` | List user notifications with unread badge count | Authenticated | `200` |
| `POST` | `/notifications/{id}/read` | Mark individual notification as read | Authenticated | `200`, `404` |
| `POST` | `/notifications/read-all` | Mark all user notifications as read | Authenticated | `200` |
| `GET` | `/dashboard` | Aggregate dashboard stats by role | Authenticated | `200` |
| `GET` | `/analytics/overview` | Statewide innovation and procurement analytics | Authenticated | `200` |
