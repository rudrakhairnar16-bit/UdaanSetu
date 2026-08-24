import csv
import json
import psycopg2

CSV_PATH = r"C:\Users\Rudra\Desktop\UdaanSetu\data\gujarat_startups.csv"

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "dbname": "udaansetu",
    "user": "udaansetu",
    "password": "udaansetu",
}

INSERT_SQL = """
    INSERT INTO records
        (kind, title, description, stage, district, sector, owner_id, parent_id, meta, is_demo, created_at, updated_at)
    VALUES
        (%(kind)s, %(title)s, %(description)s, %(stage)s, %(district)s, %(sector)s,
         NULL, NULL, %(meta)s, %(is_demo)s, NOW(), NOW())
"""

STAGE_MAP = {
    "Active": "Active",
    "Scaling": "Scaling",
    "Early Traction": "Early Traction",
    "Validation": "Validation",
    "Prototype": "Prototype",
}


def read_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            stage_raw = (row.get("company_status") or "").strip()
            stage = STAGE_MAP.get(stage_raw, stage_raw)

            focus_sector = (row.get("focus_sector") or "").strip()
            services = (row.get("services_provided") or "").strip()
            description = f"{focus_sector} - {services}" if focus_sector and services else focus_sector or services

            meta = {
                "cin": row.get("cin", ""),
                "legal_name": row.get("legal_name", ""),
                "website": row.get("company_website", ""),
                "data_as_on": row.get("data_as_on", ""),
                "state": row.get("state", ""),
                "focus_sector": focus_sector,
                "services_provided": services,
            }

            rows.append({
                "kind": "startup",
                "title": (row.get("company_name") or "").strip(),
                "description": description,
                "stage": stage,
                "district": (row.get("city") or "").strip(),
                "sector": (row.get("focus_industry") or "").strip(),
                "meta": json.dumps(meta),
                "is_demo": False,
            })
    return rows


def main():
    print("Reading CSV...")
    rows = read_csv(CSV_PATH)
    print(f"Total rows: {len(rows)}")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    print("Deleting existing demo records...")
    cur.execute("DELETE FROM records WHERE is_demo = true")
    print(f"Deleted {cur.rowcount} demo records.")

    print("Inserting records...")
    batch_size = 1000
    inserted = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        cur.executemany(INSERT_SQL, batch)
        inserted += len(batch)
        print(f"  Inserted {inserted}/{len(rows)}")

    conn.commit()
    print(f"Done. Imported {inserted} records.")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
