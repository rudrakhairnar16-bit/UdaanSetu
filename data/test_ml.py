import requests, json
BASE = "http://localhost:8080"
r = requests.post(f"{BASE}/auth/login", json={"email":"admin@udaansetu.demo","password":"Demo@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Test ML match
r = requests.get(f"{BASE}/ai/match/1", headers=headers)
print(f"Match status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    for k in ["mentors", "schemes", "incubators"]:
        if k in data:
            print(f"  {k}: {len(data[k])} matches")

# Test semantic search
r = requests.get(f"{BASE}/ai/semantic-search?q=Agriculture+Gujarat", headers=headers)
print(f"Semantic search status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    results = data.get("results", [])
    print(f"  Results: {len(results)}")

# Test ML metrics
r = requests.get(f"{BASE}/ai/metrics", headers=headers)
print(f"ML metrics status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    risk = data.get("risk_model")
    if risk:
        print(f"  Risk model accuracy: {risk.get('accuracy', 'N/A')}")
        print(f"  Training samples: {risk.get('training_samples', 'N/A')}")
    sem = data.get("semantic_engine", {})
    print(f"  Semantic model: {sem.get('model', 'N/A')}")
    print(f"  Corpus size: {sem.get('corpus_size', 'N/A')}")
