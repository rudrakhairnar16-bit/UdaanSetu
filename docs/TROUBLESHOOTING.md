# UdaanSetu — Troubleshooting & Operational Runbook

---

## 1. Common Issues & Quick Resolutions

### 1.1 Backend: `ModuleNotFoundError: No module named 'sklearn'`
- **Cause**: Scikit-Learn not installed in Python environment.
- **Resolution**:
  ```bash
  pip install scikit-learn scipy numpy
  ```
- **Note**: The ML engine will automatically fall back to rule-based scoring if scikit-learn is missing, ensuring zero downtime.

### 1.2 Frontend: `vitest is not recognized`
- **Cause**: Node dependencies not yet installed in `frontend/`.
- **Resolution**:
  ```bash
  cd frontend
  npm install
  npm test
  ```

### 1.3 CORS Rejection on API Requests
- **Cause**: Browser frontend domain is not included in `CORS_ORIGINS`.
- **Resolution**: Update `.env` or Render environment variable `CORS_ORIGINS`:
  ```env
  CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://udaansetu.vercel.app
  ```

### 1.4 Render Health Check Failing
- **Cause**: Health check configured to a protected route requiring JWT auth.
- **Resolution**: Point Render `healthCheckPath` to `/health` (which is unauthenticated and returns HTTP 200).

---

## 2. Seed Data Reset Procedure

To reset the database to a clean, known-good demonstration state:
```bash
cd backend
python -c "from app.seed import seed; seed()"
```
This drops and recreates all demo tables, seeding demo users, challenges, pilots, procurements, and research records.
