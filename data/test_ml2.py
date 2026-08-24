import requests, json
BASE = "http://localhost:8080"
r = requests.post(f"{BASE}/auth/login", json={"email":"admin@udaansetu.demo","password":"Demo@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Retrain ML models on real Gujarat data
print("Triggering ML retrain on 17,179 records...")
r = requests.post(f"{BASE}/ai/retrain", headers=headers, timeout=300)
print(f"Retrain status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    risk = data.get("results", {}).get("risk_model", {})
    sem = data.get("results", {}).get("semantic_engine", {})
    print(f"  Risk model accuracy: {risk.get('accuracy', 'N/A')}")
    print(f"  Risk model samples: {risk.get('training_samples', 'N/A')}")
    print(f"  Semantic model: {sem.get('model', 'N/A')}")
    print(f"  Corpus size: {sem.get('corpus_size', 'N/A')}")
else:
    print(f"  Error: {r.text[:200]}")

# Test match with a startup (id=1 should be a startup)
print("\nTesting smart match for startup #1...")
r = requests.get(f"{BASE}/ai/match/1", headers=headers)
print(f"Match status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"  Title: {data.get('title')}")
    for k in ["mentors", "schemes", "incubators"]:
        items = data.get(k, [])
        if items:
            print(f"  {k}: {len(items)} matches")
            for m in items[:2]:
                print(f"    - {m.get('title')}: {m.get('score')}%")

# Test semantic search
print("\nTesting semantic search for 'IT services Ahmedabad'...")
r = requests.get(f"{BASE}/ai/similar/1", headers=headers)
print(f"Similar status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"  Found {len(data)} similar records")
    for item in data[:3]:
        print(f"    - {item.get('title')}: {item.get('similarity')}%")
