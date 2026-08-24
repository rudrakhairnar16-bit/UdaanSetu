#!/usr/bin/env python3
"""Import ALL real data into PostgreSQL database."""

import json
import os
from datetime import datetime, timezone

import psycopg2


def ts(year=None):
    if year:
        return datetime(year, 6, 1, tzinfo=timezone.utc)
    return datetime.now(timezone.utc)


INSERT_TEMPLATE = (
    "INSERT INTO records (kind, title, description, stage, district, sector, meta, is_demo, created_at, updated_at) "
    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
)

DATA_DIR = r"C:\Users\Rudra\Desktop\UdaanSetu\data"


def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def t(s, maxlen=240):
    if s is None:
        return ""
    s = str(s)
    return s[:maxlen] if len(s) > maxlen else s


def main():
    conn = psycopg2.connect(
        host="localhost",
        port=5433,
        dbname="udaansetu",
        user="udaansetu",
        password="udaansetu",
    )
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute("DELETE FROM records WHERE kind != 'startup'")
    deleted = cur.rowcount
    print(f"Deleted {deleted} non-startup records")

    counts = {}

    # a) real_research_papers.json -> kind='research'
    papers = load_json("real_research_papers.json")
    for p in papers:
        kind = "research"
        title = t(p.get("title", ""), 240)
        description = p.get("topics", "") or ""
        stage = "Published"
        district = ""
        sector = t(p.get("journal", "") or "Research", 100)
        meta = {
            "doi": p.get("doi", ""),
            "publication_year": p.get("publication_year", ""),
            "cited_by_count": p.get("cited_by_count", 0),
            "authors": p.get("authors", []),
            "source": p.get("source", ""),
        }
        ts_val = ts(p.get("publication_year"))
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["research_papers"] = len(papers)
    print(f"research_papers: {len(papers)}")

    # b) real_gujarat_patents.json -> kind='ipr'
    patents = load_json("real_gujarat_patents.json")
    for p in patents:
        kind = "ipr"
        title = t(p.get("title", ""), 240)
        description = p.get("topics", "") or ""
        stage = "Filed"
        district = ""
        sector = "Patent"
        meta = {
            "doi": p.get("doi", ""),
            "publication_year": p.get("publication_year", ""),
            "cited_by_count": p.get("cited_by_count", 0),
            "authors": p.get("authors", []),
            "open_access": p.get("open_access", False),
            "type": p.get("type", ""),
        }
        ts_val = ts(p.get("publication_year"))
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["patents"] = len(patents)
    print(f"patents: {len(patents)}")

    # c) real_gujarat_research_projects.json -> kind='research'
    projects = load_json("real_gujarat_research_projects.json")
    for p in projects:
        kind = "research"
        title = t(p.get("title", ""), 240)
        description = p.get("description", "") or ""
        stage = t(p.get("status", "Active") or "Active", 60)
        district = t(p.get("district", "") or "", 100)
        sector = t(p.get("sector", "") or "Research", 100)
        meta = {
            "institution": p.get("institution", ""),
            "funding_agency": p.get("funding_agency", ""),
            "budget": p.get("budget", ""),
            "duration": p.get("duration", ""),
            "pi_name": p.get("pi_name", ""),
        }
        ts_val = ts()
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["research_projects"] = len(projects)
    print(f"research_projects: {len(projects)}")

    # d) real_gujarat_incubators.json -> kind='incubator'
    incubators = load_json("real_gujarat_incubators.json")
    for p in incubators:
        kind = "incubator"
        title = t(p.get("name", ""), 240)
        city = p.get("city", "") or ""
        focus = p.get("focus_areas", "") or ""
        description = f"{city} - {focus}" if city else focus
        stage = "Active"
        district = t(city, 100)
        sector = "Incubator"
        meta = {
            "university_or_parent": p.get("university_or_parent", ""),
            "focus_areas": p.get("focus_areas", ""),
            "website": p.get("website", ""),
            "startups_supported": p.get("startups_supported", 0),
            "founded_year": p.get("founded_year", ""),
        }
        ts_val = ts()
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["incubators"] = len(incubators)
    print(f"incubators: {len(incubators)}")

    # e) real_gujarat_mentors.json -> kind='mentor'
    mentors = load_json("real_gujarat_mentors.json")
    for p in mentors:
        kind = "mentor"
        title = t(p.get("name", ""), 240)
        description = p.get("expertise", "") or ""
        stage = "Active"
        district = t(p.get("city", "") or "", 100)
        sector = "Mentor"
        meta = {
            "organization": p.get("organization", ""),
            "linkedin_url": p.get("linkedin_url", ""),
            "years_experience": p.get("years_experience", 0),
            "startup_count": p.get("startup_count", 0),
        }
        ts_val = ts()
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["mentors"] = len(mentors)
    print(f"mentors: {len(mentors)}")

    # f) real_gujarat_institutions.json -> kind='innovation'
    institutions = load_json("real_gujarat_institutions.json")
    for p in institutions:
        kind = "innovation"
        name = p.get("name", "")
        title = t(f"{name} Research Initiative", 240)
        description = p.get("type", "") or ""
        stage = "Active"
        city = ""
        if "(" in name and ")" in name:
            city = name.split("(")[-1].replace(")", "").strip()
        elif "," in name:
            city = name.split(",")[-1].strip()
        district = t(city, 100)
        sector = "Research Institution"
        meta = {
            "institution_type": p.get("type", ""),
            "works_count": p.get("works_count", 0),
            "cited_by_count": p.get("cited_by_count", 0),
        }
        ts_val = ts()
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["institutions"] = len(institutions)
    print(f"institutions: {len(institutions)}")

    # g) real_research_topics.json -> kind='innovation'
    topics = load_json("real_research_topics.json")
    for p in topics:
        kind = "innovation"
        title = t(p.get("display_name", ""), 240)
        description = p.get("description", "") or ""
        stage = "Active"
        district = ""
        sector = "Research Topic"
        meta = {
            "works_count": p.get("works_count", 0),
            "cited_by_count": p.get("cited_by_count", 0),
        }
        ts_val = ts()
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["research_topics"] = len(topics)
    print(f"research_topics: {len(topics)}")

    # h) real_gujarat_institution_papers.json -> kind='research'
    inst_papers = load_json("real_gujarat_institution_papers.json")
    for p in inst_papers:
        kind = "research"
        title = t(p.get("title", ""), 240)
        description = p.get("topics", "") or ""
        stage = "Published"
        district = ""
        sector = t(p.get("journal", "") or "Research", 100)
        meta = {
            "doi": p.get("doi", ""),
            "publication_year": p.get("publication_year", ""),
            "cited_by_count": p.get("cited_by_count", 0),
            "authors": p.get("authors", []),
            "source": p.get("source", ""),
        }
        ts_val = ts(p.get("publication_year"))
        cur.execute(INSERT_TEMPLATE, (kind, title, description, stage, district, sector, json.dumps(meta), False, ts_val, ts_val))
    counts["inst_papers"] = len(inst_papers)
    print(f"inst_papers: {len(inst_papers)}")

    # Final summary
    cur.execute("SELECT kind, COUNT(*) FROM records GROUP BY kind ORDER BY kind")
    rows = cur.fetchall()

    total = 0
    print("\n" + "=" * 40)
    print(f"{'Kind':<15} {'Count':>6}")
    print("-" * 40)
    for kind, count in rows:
        print(f"{kind:<15} {count:>6}")
        total += count
    print("-" * 40)
    print(f"{'TOTAL':<15} {total:>6}")
    print("=" * 40)

    cur.close()
    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()
