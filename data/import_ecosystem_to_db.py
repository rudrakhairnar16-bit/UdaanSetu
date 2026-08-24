import json
import psycopg2
from datetime import datetime, timezone

DATA_DIR = r"C:\Users\Rudra\Desktop\UdaanSetu\data"

CONN_PARAMS = {
    "host": "localhost",
    "port": 5433,
    "dbname": "udaansetu",
    "user": "udaansetu",
    "password": "udaansetu",
}

INSERT_SQL = """INSERT INTO records (kind, title, description, stage, district, sector, meta, is_demo, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""


def load_json(filename):
    with open(f"{DATA_DIR}\\{filename}", "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    conn = psycopg2.connect(**CONN_PARAMS)
    cur = conn.cursor()

    # --- Step 1: Clear existing data ---
    cur.execute("DELETE FROM records WHERE kind IN ('mentor', 'incubator')")
    print(f"Cleared mentors & incubators: {cur.rowcount} rows deleted")

    cur.execute("DELETE FROM records WHERE kind = 'scheme'")
    print(f"Cleared schemes: {cur.rowcount} rows deleted")
    conn.commit()

    now = datetime.now(timezone.utc)
    counts = {"mentors": 0, "schemes": 0, "incubators": 0}

    # --- 2. Mentors ---
    mentors = load_json("real_gujarat_mentors.json")
    for m in mentors:
        expertise = ", ".join(m.get("expertise", []))
        description = f'{m["title"]} at {m["organization"]}. Expertise: {expertise}'
        meta = {
            "name": m["name"],
            "title": m["title"],
            "organization": m["organization"],
            "city": m["city"],
            "expertise": m.get("expertise", []),
            "years_experience": m.get("years_experience"),
            "startup_count": m.get("startup_count"),
            "linkedin_url": m.get("linkedin_url"),
            "bio": m.get("bio"),
            "available_for": m.get("available_for", []),
            "rating": m.get("rating"),
        }
        cur.execute(
            INSERT_SQL,
            (
                "mentor",
                m["name"],
                description,
                "Active",
                m["city"],
                "Mentor",
                json.dumps(meta),
                False,
                now,
                now,
            ),
        )
    counts["mentors"] = len(mentors)
    conn.commit()
    print(f"Inserted {counts['mentors']} mentors")

    # --- 3. Schemes ---
    schemes = load_json("real_gujarat_schemes.json")
    for s in schemes:
        benefits = s.get("benefits", "")
        eligibility = s.get("eligibility", "")
        description = f'{s["description"]}. Benefits: {benefits}. Eligibility: {eligibility}'
        meta = {
            "name": s["name"],
            "type": s.get("type"),
            "category": s.get("category"),
            "state": s.get("state"),
            "description": s.get("description"),
            "benefits": benefits,
            "eligibility": eligibility,
            "ministry": s.get("ministry"),
            "website": s.get("website"),
            "budget": s.get("budget"),
            "status": s.get("status"),
        }
        cur.execute(
            INSERT_SQL,
            (
                "scheme",
                s["name"],
                description,
                "Active",
                "",
                s.get("category", ""),
                json.dumps(meta),
                False,
                now,
                now,
            ),
        )
    counts["schemes"] = len(schemes)
    conn.commit()
    print(f"Inserted {counts['schemes']} schemes")

    # --- 4. Incubators ---
    incubators = load_json("real_gujarat_incubators.json")
    for inc in incubators:
        focus = ", ".join(inc.get("focus_areas", []))
        startups_sup = inc.get("startups_supported", 0)
        description = (
            f'{inc["type"]} incubator in {inc["city"]}. '
            f'Focus: {focus}. Supported {startups_sup} startups'
        )
        meta = {
            "name": inc["name"],
            "type": inc.get("type"),
            "city": inc["city"],
            "district": inc.get("district"),
            "focus_areas": inc.get("focus_areas", []),
            "university_or_parent": inc.get("university_or_parent"),
            "website": inc.get("website"),
            "startups_supported": startups_sup,
            "founded_year": inc.get("founded_year"),
            "capacity": inc.get("capacity"),
            "programs": inc.get("programs", []),
            "notable_startups": inc.get("notable_startups", []),
            "contact_email": inc.get("contact_email"),
        }
        cur.execute(
            INSERT_SQL,
            (
                "incubator",
                inc["name"],
                description,
                "Active",
                inc.get("district") or inc["city"],
                "Incubator",
                json.dumps(meta),
                False,
                now,
                now,
            ),
        )
    counts["incubators"] = len(incubators)
    conn.commit()
    print(f"Inserted {counts['incubators']} incubators")

    # --- Summary ---
    total = sum(counts.values())
    print("\n========== IMPORT SUMMARY ==========")
    print(f"Mentors    : {counts['mentors']}")
    print(f"Schemes    : {counts['schemes']}")
    print(f"Incubators : {counts['incubators']}")
    print(f"TOTAL      : {total}")
    print("====================================")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
