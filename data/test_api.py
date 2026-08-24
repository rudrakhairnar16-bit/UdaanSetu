import requests
import json

BASE = "http://localhost:8080"
r = requests.post(f"{BASE}/auth/login", json={"email":"admin@udaansetu.demo","password":"Demo@123"})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Test search
r = requests.get(f"{BASE}/records/search?q=Surat&kind=startup&per_page=3", headers=headers)
data = r.json()
print(f"Search 'Surat': {data['total']} results")

# Test export CSV
r = requests.get(f"{BASE}/records/export?kind=startup&format=csv", headers=headers)
lines = r.text.strip().split("\n")
print(f"CSV export: {len(lines)} rows (including header)")

# Test export JSON
r = requests.get(f"{BASE}/records/export?kind=startup&format=json&district=Ahmedabad", headers=headers)
data = json.loads(r.text)
print(f"JSON export Ahmedabad: {len(data)} records")

# Test dashboard
r = requests.get(f"{BASE}/dashboard", headers=headers)
data = r.json()
print(f"Dashboard counts: startup={data['counts'].get('startup',0)}, scheme={data['counts'].get('scheme',0)}")

# Test analytics
r = requests.get(f"{BASE}/analytics/gujarat", headers=headers)
data = r.json()
print(f"Gujarat analytics: {data['total_startups']} startups across {data['districts_count']} districts, {data['sectors_count']} sectors")

print("\nAll Phase 3 endpoints working!")
