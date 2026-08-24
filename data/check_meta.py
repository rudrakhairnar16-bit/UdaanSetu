import psycopg2, json
conn = psycopg2.connect(host='localhost', port=5433, dbname='udaansetu', user='udaansetu', password='udaansetu')
cur = conn.cursor()
for kind in ['mentor', 'scheme', 'incubator']:
    cur.execute("SELECT meta FROM records WHERE kind=%s LIMIT 1", (kind,))
    r = cur.fetchone()
    if r:
        print(f"\n=== {kind.upper()} ===")
        print(json.dumps(r[0], indent=2, default=str)[:600])
conn.close()
