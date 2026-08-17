"""AI/ML endpoint tests — updated for sentence-transformers + trained models."""
import pytest


class TestAIRisk:
    def test_risk_valid_research(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/risk/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "score" in data
        assert "level" in data
        assert "confidence" in data
        assert "feature_importance" in data
        assert "reasons" in data
        assert "method" in data
        assert data["level"] in ("Low", "Medium", "High")
        assert 0 <= data["score"] <= 100
        assert 0 <= data["confidence"] <= 100
        assert isinstance(data["feature_importance"], dict)
        assert len(data["feature_importance"]) > 0

    def test_risk_not_found(self, client, tokens):
        resp = client.get("/ai/risk/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_risk_non_research_record(self, client, tokens, seed_records):
        iid = seed_records["innovation"].id
        resp = client.get(f"/ai/risk/{iid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_risk_requires_auth(self, client, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/risk/{rid}")
        assert resp.status_code in (401, 403)

    def test_risk_has_ml_method(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/risk/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        method = resp.json()["method"]
        assert "gradient-boosting" in method or "rule-based" in method


class TestSuccessPrediction:
    def test_success_valid(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/success/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "probability" in data
        assert "confidence_interval" in data
        assert "key_factors" in data
        assert "comparable_projects" in data
        assert 0 <= data["probability"] <= 100
        ci = data["confidence_interval"]
        assert ci[0] <= data["probability"] <= ci[1]

    def test_success_not_found(self, client, tokens):
        resp = client.get("/ai/success/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404


class TestAIRecommendations:
    def test_recommendations_valid(self, client, tokens, seed_records):
        iid = seed_records["innovation"].id
        resp = client.get(f"/ai/recommendations/{iid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "matches" in data
        assert "insight" in data
        assert "method" in data
        assert isinstance(data["matches"], list)
        assert len(data["matches"]) > 0
        for match in data["matches"]:
            assert "score" in match
            assert match["type"] in ("mentor", "scheme", "incubator")

    def test_recommendations_not_found(self, client, tokens):
        resp = client.get("/ai/recommendations/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_recommendations_non_innovation(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/recommendations/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_recommendations_use_semantic(self, client, tokens, seed_records):
        iid = seed_records["innovation"].id
        resp = client.get(f"/ai/recommendations/{iid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        method = resp.json()["method"]
        assert "semantic" in method.lower() or "tf-idf" in method.lower() or "sentence" in method.lower()


class TestAISimilar:
    def test_similar_valid(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/similar/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for item in data:
            assert "similarity" in item
            assert 0 <= item["similarity"] <= 100
            assert "method" in item

    def test_similar_not_found(self, client, tokens):
        resp = client.get("/ai/similar/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_similar_excludes_self(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/similar/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        ids = [item["id"] for item in resp.json()]
        assert rid not in ids


class TestAIMatch:
    def test_match_valid_innovation(self, client, tokens, seed_records):
        iid = seed_records["innovation"].id
        resp = client.get(f"/ai/match/{iid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "mentors" in data
        assert "schemes" in data
        assert "incubators" in data
        assert isinstance(data["mentors"], list)
        assert isinstance(data["schemes"], list)
        assert isinstance(data["incubators"], list)

    def test_match_valid_startup(self, client, tokens, seed_records):
        sid = seed_records["startup"].id
        resp = client.get(f"/ai/match/{sid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200

    def test_match_not_found(self, client, tokens):
        resp = client.get("/ai/match/99999", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_match_wrong_kind(self, client, tokens, seed_records):
        rid = seed_records["research"].id
        resp = client.get(f"/ai/match/{rid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 404

    def test_match_returns_sorted(self, client, tokens, seed_records):
        iid = seed_records["innovation"].id
        resp = client.get(f"/ai/match/{iid}", headers={"Authorization": f"Bearer {tokens['admin']}"})
        data = resp.json()
        for key in ["mentors", "schemes", "incubators"]:
            scores = [m["score"] for m in data[key]]
            assert scores == sorted(scores, reverse=True)


class TestDuplicates:
    def test_find_duplicates(self, client, tokens, seed_records):
        resp = client.get("/ai/duplicates", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "clusters" in data
        assert "total_checked" in data
        assert "method" in data
        assert isinstance(data["clusters"], list)

    def test_find_duplicates_with_threshold(self, client, tokens, seed_records):
        resp = client.get("/ai/duplicates?threshold=90", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        # Higher threshold = fewer clusters
        resp2 = client.get("/ai/duplicates?threshold=50", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp2.status_code == 200


class TestAIMetrics:
    def test_metrics_admin_only(self, client, tokens, seed_records):
        resp = client.get("/ai/metrics", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "risk_model" in data
        assert "semantic_engine" in data

    def test_metrics_non_admin_denied(self, client, tokens):
        resp = client.get("/ai/metrics", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403

    def test_metrics_has_risk_model_info(self, client, tokens, seed_records):
        resp = client.get("/ai/metrics", headers={"Authorization": f"Bearer {tokens['admin']}"})
        data = resp.json()
        risk = data["risk_model"]
        assert "accuracy" in risk
        assert "precision" in risk
        assert "recall" in risk
        assert "f1" in risk
        assert "auc_roc" in risk
        assert "training_samples" in risk
        assert "feature_names" in risk
        assert "confusion_matrix" in risk
        assert risk["training_samples"] > 0

    def test_metrics_has_semantic_info(self, client, tokens, seed_records):
        resp = client.get("/ai/metrics", headers={"Authorization": f"Bearer {tokens['admin']}"})
        data = resp.json()
        sem = data["semantic_engine"]
        assert "model" in sem
        assert "corpus_size" in sem
        assert "ready" in sem
        assert sem["model"] in ("all-MiniLM-L6-v2", "TF-IDF")


class TestRetrain:
    def test_retrain_admin_only(self, client, tokens, seed_records):
        resp = client.post("/ai/retrain", headers={"Authorization": f"Bearer {tokens['admin']}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert "risk_model" in data["results"]

    def test_retrain_non_admin_denied(self, client, tokens):
        resp = client.post("/ai/retrain", headers={"Authorization": f"Bearer {tokens['researcher']}"})
        assert resp.status_code == 403
