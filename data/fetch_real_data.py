import requests
import json
import os
import time

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
TIMEOUT = 30


def fetch_json(url, label):
    print(f"Fetching {label}...")
    try:
        resp = requests.get(url, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        print(f"  [OK] {label}: received {len(data.get('results', []))} records")
        return data
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] {label}: {e}")
        return None


def save_json(data, filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Saved to {path}")


def fetch_research_papers():
    url = (
        "https://api.openalex.org/works?"
        "filter=institutions.country_code:IN,publication_year:2020-2025"
        "&per_page=200&sort=cited_by_count:desc"
    )
    raw = fetch_json(url, "Research Papers (India, 2020-2025)")
    if not raw:
        return

    papers = []
    for w in raw.get("results", []):
        topics = [t.get("display_name", "") for t in w.get("topics", [])]
        authors = [
            a.get("author", {}).get("display_name", "")
            for a in w.get("authorships", [])[:3]
        ]
        papers.append({
            "title": w.get("title"),
            "publication_year": w.get("publication_year"),
            "cited_by_count": w.get("cited_by_count", 0),
            "doi": w.get("doi"),
            "topics": topics,
            "authors": authors,
            "open_access": w.get("open_access", {}),
        })

    save_json({"count": len(papers), "papers": papers}, "real_research_papers.json")
    return papers


def fetch_gujarat_institutions():
    url = (
        "https://api.openalex.org/institutions?"
        "filter=country_code:IN&search=gujarat&per_page=50"
    )
    raw = fetch_json(url, "Gujarat Institutions")
    if not raw:
        return

    institutions = []
    for inst in raw.get("results", []):
        institutions.append({
            "display_name": inst.get("display_name"),
            "country_code": inst.get("country_code"),
            "type": inst.get("type"),
            "works_count": inst.get("works_count", 0),
            "cited_by_count": inst.get("cited_by_count", 0),
        })

    save_json({"count": len(institutions), "institutions": institutions}, "real_gujarat_institutions.json")
    return institutions


def fetch_patents():
    url = (
        "https://api.openalex.org/works?"
        "filter=institutions.country_code:IN,type:patent,publication_year:2020-2025"
        "&per_page=100&sort=cited_by_count:desc"
    )
    raw = fetch_json(url, "Indian Patents (2020-2025)")
    if not raw:
        return

    patents = []
    for w in raw.get("results", []):
        topics = [t.get("display_name", "") for t in w.get("topics", [])]
        patents.append({
            "title": w.get("title"),
            "publication_year": w.get("publication_year"),
            "cited_by_count": w.get("cited_by_count", 0),
            "open_access": w.get("open_access", {}),
            "topics": topics,
        })

    save_json({"count": len(patents), "patents": patents}, "real_patents.json")
    return patents


def fetch_research_topics():
    url = "https://api.openalex.org/topics?search=gujarat+india&per_page=30"
    raw = fetch_json(url, "Research Topics (Gujarat)")
    if not raw:
        return

    topics = []
    for t in raw.get("results", []):
        topics.append({
            "display_name": t.get("display_name"),
            "description": t.get("description"),
            "works_count": t.get("works_count", 0),
            "cited_by_count": t.get("cited_by_count", 0),
        })

    save_json({"count": len(topics), "topics": topics}, "real_research_topics.json")
    return topics


def main():
    print("=" * 60)
    print("UdaanSetu - Real Data Fetcher")
    print("=" * 60)

    results = {}
    results["papers"] = fetch_research_papers()
    time.sleep(1)

    results["institutions"] = fetch_gujarat_institutions()
    time.sleep(1)

    results["patents"] = fetch_patents()
    time.sleep(1)

    results["topics"] = fetch_research_topics()

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for key, data in results.items():
        if data is not None:
            print(f"  {key:20s}: {len(data):>4d} records")
        else:
            print(f"  {key:20s}: FAILED")
    print("=" * 60)
    print("Done.")


if __name__ == "__main__":
    main()
