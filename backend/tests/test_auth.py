"""Authentication and authorization tests."""
import pytest


class TestLogin:
    def test_login_success(self, client, seed_users):
        resp = client.post("/auth/login", json={
            "email": "admin@test.demo", "password": "TestPass1"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@test.demo"

    def test_login_wrong_password(self, client, seed_users):
        resp = client.post("/auth/login", json={
            "email": "admin@test.demo", "password": "WrongPassword1"
        })
        assert resp.status_code == 401

    def test_login_nonexistent_email(self, client, seed_users):
        resp = client.post("/auth/login", json={
            "email": "nonexistent@test.demo", "password": "TestPass1"
        })
        assert resp.status_code == 401

    def test_login_invalid_email_format(self, client, seed_users):
        resp = client.post("/auth/login", json={
            "email": "not-an-email", "password": "TestPass1"
        })
        assert resp.status_code == 422  # Pydantic validation

    def test_login_missing_fields(self, client, seed_users):
        resp = client.post("/auth/login", json={"email": "admin@test.demo"})
        assert resp.status_code == 422

    def test_login_all_roles(self, client, seed_users):
        for role in ["admin", "researcher", "mentor", "investor", "incubator"]:
            resp = client.post("/auth/login", json={
                "email": f"{role}@test.demo", "password": "TestPass1"
            })
            assert resp.status_code == 200, f"Failed for role: {role}"
            assert resp.json()["user"]["role"] == role


class TestAuthMe:
    def test_me_authenticated(self, client, tokens):
        resp = client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "admin@test.demo"

    def test_me_no_token(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code in (401, 403)

    def test_me_invalid_token(self, client):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert resp.status_code == 401

    def test_me_all_roles(self, client, tokens):
        for role, token in tokens.items():
            resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert resp.status_code == 200, f"Failed for role: {role}"
            assert resp.json()["role"] == role


class TestLogout:
    def test_logout_success(self, client, tokens):
        resp = client.post("/auth/logout", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        # Token should now be blacklisted
        resp2 = client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp2.status_code == 401

    def test_logout_no_token(self, client):
        resp = client.post("/auth/logout")
        assert resp.status_code in (401, 403)


class TestRBAC:
    def test_admin_can_list_users(self, client, tokens, seed_users):
        resp = client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 5

    def test_researcher_cannot_list_users(self, client, tokens):
        resp = client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_mentor_cannot_list_users(self, client, tokens):
        resp = client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['mentor']}"})
        assert resp.status_code == 403

    def test_investor_cannot_list_users(self, client, tokens):
        resp = client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['investor']}"})
        assert resp.status_code == 403

    def test_admin_can_view_audit(self, client, tokens):
        resp = client.get("/audit", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200

    def test_researcher_cannot_view_audit(self, client, tokens):
        resp = client.get("/audit", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_admin_can_delete_records(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.delete(f"/records/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200

    def test_researcher_cannot_delete_records(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.delete(f"/records/{rid}", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_mentor_can_create_records(self, client, tokens):
        resp = client.post("/records/mentor", json={
            "title": "New Mentor", "description": "Test", "stage": "Available"
        }, headers={"Authorization": f"Bearer {tokens['mentor']}"})
        assert resp.status_code == 200

    def test_investor_can_create_records(self, client, tokens):
        resp = client.post("/records/scheme", json={
            "title": "New Scheme", "description": "Test", "stage": "Open"
        }, headers={"Authorization": f"Bearer {tokens['investor']}"})
        assert resp.status_code == 200
