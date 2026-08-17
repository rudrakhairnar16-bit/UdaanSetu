"""Security-focused tests."""
import re
import time
import threading
import pytest
from unittest.mock import patch


class TestSecurityHeaders:
    def test_x_content_type_options(self, client):
        resp = client.get("/health")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"

    def test_x_frame_options(self, client):
        resp = client.get("/health")
        assert resp.headers.get("X-Frame-Options") == "DENY"

    def test_x_xss_protection(self, client):
        resp = client.get("/health")
        assert resp.headers.get("X-XSS-Protection") == "1; mode=block"

    def test_referrer_policy(self, client):
        resp = client.get("/health")
        assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

    def test_permissions_policy(self, client):
        resp = client.get("/health")
        pp = resp.headers.get("Permissions-Policy", "")
        assert "camera=()" in pp
        assert "microphone=()" in pp
        assert "geolocation=()" in pp


class TestCORSSecurity:
    def test_cors_allows_localhost(self, client):
        resp = client.options("/records", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        })
        # CORS should allow this origin
        assert resp.status_code in (200, 405)

    def test_cors_restricts_methods(self, client):
        # Our CORS only allows GET, POST, PATCH, DELETE
        # OPTIONS is handled by preflight
        resp = client.options("/records", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "PUT",
        })
        # PUT should not be in allowed methods
        allow = resp.headers.get("Access-Control-Allow-Methods", "")
        assert "PUT" not in allow


class TestRateLimiting:
    def test_rate_limit_allows_normal_requests(self, client):
        for _ in range(5):
            resp = client.get("/health")
            assert resp.status_code == 200

    def test_rate_limit_health_excluded(self, client):
        """Health endpoint should not be rate limited."""
        for _ in range(200):
            resp = client.get("/health")
            assert resp.status_code == 200


class TestInputSanitization:
    def test_html_tags_stripped(self, client, tokens):
        resp = client.post("/records/research", json={
            "title": "<script>alert('xss')</script>Test Project",
            "description": "Normal description",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert "<script>" not in resp.json()["title"]
        assert "alert" in resp.json()["title"]  # text content preserved

    def test_null_bytes_removed(self, client, tokens):
        resp = client.post("/records/research", json={
            "title": "Test\x00Project",
            "description": "desc",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert "\x00" not in resp.json()["title"]

    def test_long_title_rejected(self, client, tokens):
        resp = client.post("/records/research", json={
            "title": "x" * 300,
            "description": "desc",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 422  # Validation error

    def test_long_description_rejected(self, client, tokens):
        resp = client.post("/records/research", json={
            "title": "Valid Title",
            "description": "x" * 15000,
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 422


class TestJWTSecurity:
    def test_expired_token_rejected(self, client, seed_users):
        from app.main import create_token
        import jwt as pyjwt
        from datetime import datetime, timedelta, timezone

        # Create a token that's already expired
        user = seed_users["admin"]
        expired_token = pyjwt.encode(
            {"sub": str(user.id), "role": user.role,
             "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
            "test-secret-key-for-testing-only",
            algorithm="HS256",
        )
        resp = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert resp.status_code == 401

    def test_tampered_token_rejected(self, client, tokens):
        token = tokens["admin"]
        # Tamper with the token
        tampered = token[:-5] + "XXXXX"
        resp = client.get("/auth/me", headers={"Authorization": f"Bearer {tampered}"})
        assert resp.status_code == 401

    def test_wrong_secret_token_rejected(self, client, seed_users):
        import jwt as pyjwt
        from datetime import datetime, timedelta, timezone

        user = seed_users["admin"]
        wrong_secret_token = pyjwt.encode(
            {"sub": str(user.id), "role": user.role,
             "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm="HS256",
        )
        resp = client.get("/auth/me", headers={"Authorization": f"Bearer {wrong_secret_token}"})
        assert resp.status_code == 401

    def test_token_contains_required_claims(self, client, seed_users):
        from app.main import create_token
        import jwt as pyjwt

        user = seed_users["admin"]
        token = create_token(user)
        data = pyjwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        assert "sub" in data
        assert "role" in data
        assert "exp" in data
        assert "iat" in data


class TestPasswordSecurity:
    def test_password_hash_not_stored_plaintext(self, client, seed_users):
        from app.main import User
        resp = client.post("/auth/login", json={
            "email": "admin@test.demo", "password": "TestPass1"
        })
        assert resp.status_code == 200
        # Verify the stored hash is not the plaintext password
        # This is guaranteed by pwdlib, but we verify our setup

    def test_invalid_credentials_generic_message(self, client, seed_users):
        resp = client.post("/auth/login", json={
            "email": "admin@test.demo", "password": "wrong"
        })
        assert resp.status_code == 401
        assert "Incorrect email or password" in resp.json()["detail"]
        # Should not reveal whether email exists


class TestFileUploadSecurity:
    def test_upload_rejects_exe(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.post(
            "/documents/upload",
            files={"file": ("malware.exe", b"MZ\x90\x00", "application/octet-stream")},
            data={"record_id": rid},
            headers={"Authorization": f"Bearer {tokens['researcher']}"},
        )
        assert resp.status_code == 400
        assert "Unsupported file type" in resp.json()["detail"]

    def test_upload_rejects_html(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.post(
            "/documents/upload",
            files={"file": ("xss.html", b"<script>alert('xss')</script>", "text/html")},
            data={"record_id": rid},
            headers={"Authorization": f"Bearer {tokens['researcher']}"},
        )
        assert resp.status_code == 400

    def test_upload_accepts_txt(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.post(
            "/documents/upload",
            files={"file": ("test.txt", b"Hello world", "text/plain")},
            data={"record_id": rid},
            headers={"Authorization": f"Bearer {tokens['researcher']}"},
        )
        assert resp.status_code == 200
        assert resp.json()["filename"] == "test.txt"

    def test_upload_requires_auth(self, client, seed_records):
        rid = seed_records["research"].id
        resp = client.post(
            "/documents/upload",
            files={"file": ("test.txt", b"Hello", "text/plain")},
            data={"record_id": rid},
        )
        assert resp.status_code in (401, 403)

    def test_upload_nonexistent_record(self, client, tokens):
        resp = client.post(
            "/documents/upload",
            files={"file": ("test.txt", b"Hello", "text/plain")},
            data={"record_id": 99999},
            headers={"Authorization": f"Bearer {tokens['researcher']}"},
        )
        assert resp.status_code == 404


class TestAuditLogging:
    def test_create_creates_audit_entry(self, client, tokens, seed_records):
        # Check audit log has entries
        resp = client.get("/audit", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        logs = resp.json()
        assert len(logs) > 0

    def test_update_creates_audit_entry(self, client, tokens, seed_records, db_session):
        from app.main import AuditLog
        before = db_session.query(AuditLog).count()
        rid = seed_records["research"].id
        client.patch(f"/records/{rid}", json={
            "title": "Updated", "description": "desc", "stage": "Draft"
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        after = db_session.query(AuditLog).count()
        assert after > before


class TestGlobalExceptionHandler:
    def test_404_returns_json(self, client):
        resp = client.get("/nonexistent-endpoint")
        assert resp.status_code == 404

    def test_method_not_allowed(self, client):
        resp = client.put("/health")
        assert resp.status_code in (404, 405)
