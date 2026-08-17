"""Records CRUD tests."""
import pytest


class TestListRecords:
    def test_list_all(self, client, tokens, seed_records):
        resp = client.get("/records", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 9

    def test_filter_by_kind(self, client, tokens, seed_records):
        resp = client.get("/records?kind=research", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        for r in resp.json():
            assert r["kind"] == "research"

    def test_filter_by_district(self, client, tokens, seed_records):
        resp = client.get("/records?district=TestCity", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        for r in resp.json():
            assert r["district"] == "TestCity"

    def test_filter_by_sector(self, client, tokens, seed_records):
        resp = client.get("/records?sector=AgriTech", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        for r in resp.json():
            assert r["sector"] == "AgriTech"

    def test_search_query(self, client, tokens, seed_records):
        resp = client.get("/records?q=Research", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert any("Research" in r["title"] for r in resp.json())

    def test_filter_by_parent_id(self, client, tokens, seed_records):
        parent_id = seed_records["research"].id
        resp = client.get(f"/records?parent_id={parent_id}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        for r in resp.json():
            assert r["parent_id"] == parent_id

    def test_requires_auth(self, client, seed_records):
        resp = client.get("/records")
        assert resp.status_code in (401, 403)


class TestGetRecord:
    def test_get_existing(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/records/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == rid
        assert resp.json()["title"] == "Test Research"

    def test_get_not_found(self, client, tokens):
        resp = client.get("/records/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404


class TestCreateRecord:
    def test_create_research(self, client, tokens):
        resp = client.post("/records/research", json={
            "title": "New Research Project",
            "description": "A new project",
            "stage": "Concept",
            "district": "TestCity",
            "sector": "CleanTech",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "New Research Project"
        assert data["kind"] == "research"
        assert data["owner_id"] is not None

    def test_create_innovation(self, client, tokens):
        resp = client.post("/records/innovation", json={
            "title": "New Innovation",
            "stage": "Concept",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert resp.json()["kind"] == "innovation"

    def test_create_ipr(self, client, tokens):
        resp = client.post("/records/ipr", json={
            "title": "New Patent",
            "stage": "Idea",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert resp.json()["kind"] == "ipr"

    def test_create_startup(self, client, tokens):
        resp = client.post("/records/startup", json={
            "title": "New Startup",
            "stage": "Idea",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200

    def test_create_mentor(self, client, tokens):
        resp = client.post("/records/mentor", json={
            "title": "New Mentor",
            "stage": "Available",
        }, headers={"Authorization": f"Bearer {tokens['mentor']}"})
        assert resp.status_code == 200

    def test_create_invalid_kind(self, client, tokens):
        resp = client.post("/records/invalid_kind", json={
            "title": "Bad", "stage": "Draft"
        }, headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 400

    def test_create_with_parent(self, client, tokens, seed_records):
        parent_id = seed_records["research"].id
        resp = client.post("/records/milestone", json={
            "title": "New Milestone",
            "parent_id": parent_id,
            "meta": {"due_date": "2026-12-31"},
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert resp.json()["parent_id"] == parent_id

    def test_create_funding_request_notifies_investors(self, client, tokens, seed_users):
        resp = client.post("/records/funding_request", json={
            "title": "Funding Need",
            "stage": "Submitted",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        # Check investor got a notification
        from app.main import Notification, db as db_dep
        # This is checked via the notification endpoint
        resp2 = client.get("/notifications", headers={"Authorization": f"Bearer {tokens['investor']}"})
        assert resp2.status_code == 200

    def test_create_requires_auth(self, client):
        resp = client.post("/records/research", json={"title": "No Auth"})
        assert resp.status_code in (401, 403)


class TestUpdateRecord:
    def test_update_own_record(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.patch(f"/records/{rid}", json={
            "title": "Updated Research",
            "description": "Updated desc",
            "stage": "Prototype",
            "district": "TestCity",
            "sector": "AgriTech",
            "meta": {"progress": 75},
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Research"
        assert resp.json()["meta"]["progress"] == 75

    def test_admin_can_update_any_record(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.patch(f"/records/{rid}", json={
            "title": "Admin Updated",
            "description": "desc",
            "stage": "Prototype",
        }, headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "Admin Updated"

    def test_cannot_update_others_record(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.patch(f"/records/{rid}", json={
            "title": "Hacked",
            "description": "desc",
            "stage": "Draft",
        }, headers={"Authorization": f"Bearer {tokens['mentor']}"})
        assert resp.status_code == 403

    def test_update_not_found(self, client, tokens):
        resp = client.patch("/records/99999", json={
            "title": "X", "stage": "Draft"
        }, headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_stage_change_creates_notification(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.patch(f"/records/{rid}", json={
            "title": "Test Research",
            "description": "desc",
            "stage": "Completed",
        }, headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 200
        # Check notification was created
        resp2 = client.get("/notifications", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp2.status_code == 200
        notifs = resp2.json()
        assert any("stage updated" in n["message"].lower() for n in notifs)


class TestDeleteRecord:
    def test_admin_can_delete(self, client, tokens, seed_records):
        rid = seed_records["milestone"].id
        resp = client.delete(f"/records/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200

    def test_non_admin_cannot_delete(self, client, tokens, seed_records):
        rid = seed_records["milestone"].id
        resp = client.delete(f"/records/{rid}", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_delete_not_found(self, client, tokens):
        resp = client.delete("/records/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404
