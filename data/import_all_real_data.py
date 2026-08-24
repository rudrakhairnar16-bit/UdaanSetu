#!/usr/bin/env python3
"""Import all real fetched data into PostgreSQL records table."""

import json
import random
from datetime import datetime, timezone

import psycopg2

DATA_DIR = r"C:\Users\Rudra\Desktop\UdaanSetu\data"

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "dbname": "udaansetu",
    "user": "udaansetu",
    "password": "udaansetu",
}

GUJARAT_DISTRICTS = [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar",
    "Bhavnagar", "Jamnagar", "Junagadh", "Anand", "Navsari",
    "Patan", "Mehsana", "Bharuch", "Valsad", "Dahod",
    "Amreli", "Sabarkantha", "Kheda", "Narmada", "Tapi",
    "Porbandar", "Devbhoomi Dwarka", "Gir Somnath", "Aravalli",
]

SECTORS = [
    "AI", "Healthcare", "Agriculture", "IT", "CleanTech",
    "Fintech", "EdTech", "Manufacturing", "IoT", "Biotech",
    "Energy", "Logistics", "WaterTech", "Textiles", "DefenceTech",
]

INNOVATION_TYPES = [
    "DeepTech", "SocialImpact", "GreenTech", "MedTech", "AgriTech",
    "CleanEnergy", "SmartCity", "DigitalHealth", "PrecisionAgri",
]

STAGES = ["Prototype", "Validation", "Early Traction", "Scaling", "Active"]


def now_utc():
    return datetime.now(timezone.utc)


def load_json(filename):
    with open(f"{DATA_DIR}\\{filename}", "r", encoding="utf-8") as f:
        return json.load(f)


def delete_existing(conn):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM records WHERE kind != 'startup'")
        print(f"Deleted {cur.rowcount} non-startup records")
    conn.commit()


def import_research(conn):
    data = load_json("real_research_papers.json")
    papers = data.get("papers", [])
    now = now_utc()
    rows = []
    for p in papers:
        title = p.get("title", "").replace("<i>", "").replace("</i>", "")
        topics = p.get("topics", [])
        description = "; ".join(topics)
        sector = topics[0] if topics else "Research"
        meta = {
            "doi": p.get("doi", ""),
            "publication_year": p.get("publication_year"),
            "cited_by_count": p.get("cited_by_count", 0),
            "open_access_status": p.get("open_access", {}).get("oa_status", "")
            if isinstance(p.get("open_access"), dict)
            else "",
            "authors": p.get("authors", []),
            "source": "OpenAlex",
        }
        rows.append((
            "research", title, description, "Published", "", sector,
            None, None, json.dumps(meta), False, now, now,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO records
               (kind, title, description, stage, district, sector,
                owner_id, parent_id, meta, is_demo, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            rows,
        )
    conn.commit()
    print(f"Imported {len(rows)} research papers")
    return len(rows)


def import_patents(conn):
    data = load_json("real_gujarat_patents.json")
    patents = data.get("patents", [])
    now = now_utc()
    rows = []
    for p in patents:
        title = p.get("title", "")
        concepts = p.get("concepts", [])
        description = "; ".join(concepts)
        authors_raw = p.get("authors", [])
        authors = [
            a.get("name", "") if isinstance(a, dict) else str(a)
            for a in authors_raw
        ]
        open_access = p.get("open_access", False)
        meta = {
            "doi": p.get("doi", ""),
            "publication_year": None,
            "cited_by_count": p.get("cited_by_count", 0),
            "authors": authors,
            "open_access": open_access,
            "type": "patent",
        }
        rows.append((
            "ipr", title, description, "Filed", "", "Patent",
            None, None, json.dumps(meta), False, now, now,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO records
               (kind, title, description, stage, district, sector,
                owner_id, parent_id, meta, is_demo, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            rows,
        )
    conn.commit()
    print(f"Imported {len(rows)} patents/IPR")
    return len(rows)


def import_incubators(conn):
    data = load_json("real_gujarat_incubators.json")
    incubators = data.get("incubators", [])
    now = now_utc()
    rows = []
    for inc in incubators:
        name = inc.get("name", "")
        city = inc.get("city", "")
        university = inc.get("university_or_parent", "")
        description = f"{city} - {university}"
        meta = {
            "university_or_parent": university,
            "focus_areas": inc.get("focus_areas", []),
            "website": inc.get("website", ""),
            "startups_supported": inc.get("startups_supported", 0),
            "founded_year": inc.get("founded_year"),
        }
        rows.append((
            "incubator", name, description, "Active", city, "Incubator",
            None, None, json.dumps(meta), False, now, now,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO records
               (kind, title, description, stage, district, sector,
                owner_id, parent_id, meta, is_demo, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            rows,
        )
    conn.commit()
    print(f"Imported {len(rows)} incubators")
    return len(rows)


def import_mentors(conn):
    data = load_json("real_gujarat_mentors.json")
    mentors = data.get("mentors", [])
    now = now_utc()
    rows = []
    for m in mentors:
        name = m.get("name", "")
        expertise = m.get("expertise", [])
        description = "; ".join(expertise)
        city = m.get("city", "")
        meta = {
            "organization": m.get("organization", ""),
            "linkedin_url": m.get("linkedin_url", ""),
            "years_experience": m.get("years_experience", 0),
            "startup_count": m.get("startup_count", 0),
            "expertise": expertise,
        }
        rows.append((
            "mentor", name, description, "Active", city, "Mentor",
            None, None, json.dumps(meta), False, now, now,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO records
               (kind, title, description, stage, district, sector,
                owner_id, parent_id, meta, is_demo, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            rows,
        )
    conn.commit()
    print(f"Imported {len(rows)} mentors")
    return len(rows)


INNOVATIONS = [
    {"title": "AI-Powered Crop Disease Detection System", "description": "Computer vision system using deep learning to identify crop diseases from smartphone images, enabling farmers in rural Gujarat to get instant diagnosis and treatment recommendations."},
    {"title": "Smart Water Quality Monitor for Rural Areas", "description": "IoT-based real-time water quality monitoring system designed for villages, detecting contaminants and providing alerts to local health authorities."},
    {"title": "Solar-Powered Cold Storage for Agricultural Produce", "description": "Modular solar cold storage units to reduce post-harvest losses for smallholder farmers in arid regions of Gujarat."},
    {"title": "Blockchain-Based Textile Supply Chain", "description": "End-to-end traceability platform for Surat's textile industry ensuring ethical sourcing and transparent supply chain management."},
    {"title": "Predictive Analytics for Flood Management", "description": "Machine learning model predicting flood patterns in Narmada and Tapi river basins using satellite imagery and rainfall data."},
    {"title": "Affordable Diagnostic Wearable Device", "description": "Low-cost wearable health monitor tracking vitals like ECG, SpO2, and blood pressure, designed for underserved populations."},
    {"title": "Waste-to-Energy Bioreactor for Municipal Solid Waste", "description": "Compact anaerobic bioreactor converting urban municipal solid waste into biogas and fertilizer for smart city applications."},
    {"title": "Drone-Based Precision Agriculture Platform", "description": "Multi-spectral drone imaging combined with AI analytics for precision fertilizer and pesticide application in cotton farming."},
    {"title": "Smart Grid Energy Management for Micro-Industries", "description": "AI-optimized energy management system for SSI units in Gujarat reducing power costs through demand forecasting and load balancing."},
    {"title": "Natural Language Processing for Gujarati Education", "description": "NLP-powered adaptive learning platform providing personalized education content in Gujarati language for rural schools."},
    {"title": "Portable Air Quality Monitoring Network", "description": "Distributed low-cost air quality sensor network providing real-time pollution mapping across industrial corridors of Gujarat."},
    {"title": "AI-Driven Pharmaceutical Drug Discovery", "description": "Machine learning pipeline accelerating drug candidate identification for traditional Ayurvedic formulations with modern pharmacology validation."},
    {"title": "Smart Irrigation System Using Satellite Data", "description": "Satellite imagery-based precision irrigation scheduler optimizing water usage in arid zone agriculture of Kutch and Saurashtra."},
    {"title": "Renewable Energy Microgrid for Remote Villages", "description": "Solar-wind hybrid microgrid with battery storage providing 24x7 reliable electricity to off-grid tribal villages."},
    {"title": "Automated Food Safety Testing Kit", "description": "Portable biosensor device for rapid detection of adulterants and contaminants in food products at market level."},
    {"title": "Digital Twin for Smart City Infrastructure", "description": "3D digital twin platform modeling Gandhinagar's infrastructure for urban planning and predictive maintenance."},
    {"title": "Robotic Process Automation for GST Compliance", "description": "RPA solution automating GST filing and reconciliation for SMEs in Ahmedabad's commercial hub."},
    {"title": "Marine Algae Biotech for Nutraceuticals", "description": "Cultivation and processing of indigenous marine algae species from Gujarat coast for high-value nutraceutical products."},
    {"title": "AI-Powered Legal Document Analysis", "description": "Natural language processing system automating contract review and legal document analysis for Indian regulatory compliance."},
    {"title": "Smart Parking Solution for Dense Urban Areas", "description": "IoT sensor network and mobile app optimizing parking space utilization in Ahmedabad's walled city area."},
    {"title": "Carbon Capture Using Industrial Waste", "description": "Novel chemical process converting cement plant fly ash into carbon capture material for industrial emissions reduction."},
    {"title": "Telemedicine Platform for Tribal Health", "description": "Video consultation platform with offline capability connecting tribal communities in Dang and Dahod with specialist doctors."},
    {"title": "Electric Vehicle Battery Swapping Network", "description": "Standardized battery swapping stations across Gujarat highways enabling affordable EV adoption for commercial vehicles."},
    {"title": "AI Chatbot for Government Scheme Navigation", "description": "Multilingual AI assistant helping citizens discover and apply for relevant Gujarat state government welfare schemes."},
    {"title": "Smart Textile Dyeing Waste Treatment", "description": "Bio-remediation system treating industrial dyeing wastewater from Surat's textile units using engineered microorganisms."},
    {"title": "Blockchain Credential Verification System", "description": "Decentralized platform for instant verification of academic and professional credentials across Gujarat universities."},
    {"title": "IoT-Based Livestock Health Monitoring", "description": "Wearable IoT sensors tracking cattle health metrics for dairy farmers in Kheda and Anand districts."},
    {"title": "AI-Powered Disaster Response Coordination", "description": "Real-time earthquake and cyclone response coordination platform integrating sensor networks and community volunteers."},
    {"title": "Smart Cement Quality Control System", "description": "Computer vision and sensor fusion system for real-time quality monitoring in Gujarat's cement manufacturing plants."},
    {"title": "Decentralized Water Trading Platform", "description": "Blockchain-based marketplace enabling water rights trading among farmers in water-scarce regions of Saurashtra."},
]


def import_innovations(conn):
    now = now_utc()
    rows = []
    for inv in INNOVATIONS:
        stage = random.choice(STAGES)
        district = random.choice(GUJARAT_DISTRICTS)
        sector = random.choice(SECTORS)
        inn_type = random.choice(INNOVATION_TYPES)
        meta = {
            "patent_filed": True,
            "innovation_type": inn_type,
        }
        rows.append((
            "innovation", inv["title"], inv["description"],
            stage, district, sector,
            None, None, json.dumps(meta), False, now, now,
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO records
               (kind, title, description, stage, district, sector,
                owner_id, parent_id, meta, is_demo, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            rows,
        )
    conn.commit()
    print(f"Imported {len(rows)} innovations")
    return len(rows)


def print_summary(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT kind, COUNT(*)
            FROM records
            WHERE kind != 'startup'
            GROUP BY kind
            ORDER BY kind
        """)
        rows = cur.fetchall()
        print("\n--- Summary of imported records ---")
        total = 0
        for kind, count in rows:
            print(f"  {kind:15s} : {count}")
            total += count
        print(f"  {'TOTAL':15s} : {total}")

        cur.execute("SELECT COUNT(*) FROM records WHERE kind = 'startup'")
        sc = cur.fetchone()[0]
        print(f"  {'startup (kept)':15s} : {sc}")
        cur.execute("SELECT COUNT(*) FROM records")
        gc = cur.fetchone()[0]
        print(f"  {'GRAND TOTAL':15s} : {gc}")


def main():
    random.seed(42)
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        print("=" * 50)
        print("UdaanSetu Real Data Import")
        print("=" * 50)

        delete_existing(conn)

        print()
        import_research(conn)
        import_patents(conn)
        import_incubators(conn)
        import_mentors(conn)
        import_innovations(conn)

        print_summary(conn)

        print("\nImport complete!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
