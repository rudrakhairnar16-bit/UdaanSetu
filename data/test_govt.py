import psycopg2, requests, json

# Get a real CIN from DB
conn = psycopg2.connect(host='localhost', port=5433, dbname='udaansetu', user='udaansetu', password='udaansetu')
cur = conn.cursor()
cur.execute("SELECT meta->>'cin' FROM records WHERE kind='startup' AND meta->>'cin' IS NOT NULL LIMIT 1")
cin = cur.fetchone()[0]
print(f"Testing DPIIT lookup for CIN: {cin}")
conn.close()

# Test DPIIT endpoint
BASE = "http://localhost:8080"
r = requests.post(f"{BASE}/auth/login", json={"email":"admin@udaansetu.demo","password":"Demo@123"})
t = r.json()["access_token"]
h = {"Authorization": f"Bearer {t}"}
r = requests.get(f"{BASE}/government/gujarat/dpiit-status/{cin}", headers=h, timeout=10)
print(f"Status: {r.status_code}")
data = r.json()
print(f"  Found: {data.get('found')}")
print(f"  Company: {data.get('company_name')}")
print(f"  District: {data.get('district')}")
print(f"  Sector: {data.get('sector')}")
print(f"  Status: {data.get('status')}")
