import psycopg2
conn = psycopg2.connect(host='localhost', port=5433, dbname='udaansetu', user='udaansetu', password='udaansetu')
cur = conn.cursor()
cur.execute("SELECT id, meta FROM records WHERE kind='startup' LIMIT 1")
row = cur.fetchone()
print(f"ID: {row[0]}")
print(f"Meta type: {type(row[1])}")
print(f"Meta: {row[1]}")
cin_val = row[1].get('cin') if isinstance(row[1], dict) else None
print(f"CIN from dict: {cin_val}")
print(f"CIN type: {type(cin_val)}")

# Test SQL cast approach
cur.execute("SELECT id FROM records WHERE kind='startup' AND (meta->>'cin') = %s", (cin_val,))
r = cur.fetchone()
print(f"Direct SQL match: {r}")
conn.close()
