"""Dashboard, analytics, notifications, and misc endpoint tests."""
import pytest


class TestDashboard:
    def test_dashboard_returns_all_fields(self, client, tokens, seed_records):
        resp = client.get("/dashboard", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "banner" in data
        assert "counts" in data
        assert "at_risk" in data
        assert "recent" in data
        assert "pipeline" in data
        assert "districts" in data

    def test_dashboard_counts(self, client, tokens, seed_records):
        resp = client.get("/dashboard", headers={"Authorization": f"Bearer {tokens['admin']}"})
        counts = resp.json()["counts"]
        assert counts["research"] >= 1
        assert counts["innovation"] >= 1
        assert counts["ipr"] >= 1
        assert counts["startup"] >= 1
        assert counts["mentor"] >= 1
        assert counts["scheme"] >= 1
        assert counts["incubator"] >= 1

    def test_dashboard_at_risk(self, client, tokens, seed_records):
        resp = client.get("/dashboard", headers={"Authorization": f"Bearer {tokens['admin']}"})
        at_risk = resp.json()["at_risk"]
        assert isinstance(at_risk, list)

    def test_dashboard_district_filter(self, client, tokens, seed_records):
        resp = client.get("/dashboard?district=TestCity", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert resp.json()["banner"] == "UdaanSetu — Maharashtra Startup Procurement Platform"

    def test_dashboard_requires_auth(self, client, seed_records):
        resp = client.get("/dashboard")
        assert resp.status_code in (401, 403)


class TestAnalytics:
    def test_overview_returns_fields(self, client, tokens, seed_records):
        resp = client.get("/analytics/overview", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "total_records" in data
        assert "by_kind" in data
        assert "by_sector" in data
        assert "by_district" in data
        assert "avg_research_progress" in data
        assert "total_funding_required" in data
        assert "total_startup_revenue" in data
        assert "total_jobs_created" in data
        assert "total_farmers_reached" in data
        assert data["total_records"] >= 9

    def test_overview_has_demo_label(self, client, tokens, seed_records):
        resp = client.get("/analytics/overview", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert "Maharashtra" in resp.json()["label"]

    def test_district_analytics(self, client, tokens, seed_records):
        resp = client.get("/analytics/districts", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "districts" in data
        assert "label" in data
        assert len(data["districts"]) > 0


class TestNotifications:
    def test_list_notifications(self, client, tokens, seed_records):
        resp = client.get("/notifications", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        notifs = resp.json()
        assert len(notifs) >= 1
        for n in notifs:
            assert "id" in n
            assert "message" in n
            assert "kind" in n
            assert "read" in n

    def test_mark_notification_read(self, client, tokens, seed_records, db_session):
        from app.main import Notification
        # Get an unread notification
        notif = db_session.query(Notification).filter_by(user_id=seed_users_id(seed_records, "researcher")).first()
        if notif:
            resp = client.patch(f"/notifications/{notif.id}/read",
                              headers={"Authorization": f"Bearer {tokens['researcher']}"})
            assert resp.status_code == 200

    def test_cannot_read_others_notification(self, client, tokens, seed_records, db_session):
        from app.main import Notification
        notif = db_session.query(Notification).first()
        if notif:
            resp = client.patch(f"/notifications/{notif.id}/read",
                              headers={"Authorization": f"Bearer {tokens['mentor']}"})
            assert resp.status_code == 404

    def test_mark_all_read(self, client, tokens):
        resp = client.post("/notifications/read-all",
                         headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        # Verify all are read
        resp2 = client.get("/notifications", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        for n in resp2.json():
            assert n["read"] is True


def seed_users_id(seed_records, role):
    """Helper to get user ID from seed_records fixture."""
    # Access the research record's owner_id
    if role == "researcher":
        return seed_records["research"].owner_id
    return None


class TestAuditLog:
    def test_admin_can_view(self, client, tokens, seed_records):
        resp = client.get("/audit", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_non_admin_cannot_view(self, client, tokens):
        resp = client.get("/audit", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_audit_limit_parameter(self, client, tokens, seed_records):
        resp = client.get("/audit?limit=5", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert len(resp.json()) <= 5


class TestHealth:
    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "UdaanSetu API"
        assert data["demo_data"] is True
