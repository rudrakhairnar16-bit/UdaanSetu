"""
Generate a realistic Gujarat DPIIT startup dataset.
Produces 17,179 startup records matching the real DPIIT count for Gujarat.
Output: gujarat_startups.csv in the same directory.
"""

import csv
import random
import os
from collections import Counter

random.seed(42)

TOTAL_RECORDS = 17179
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "gujarat_startups.csv")
DATA_AS_ON = "05-08-2026"

DISTRICTS = {
    "Ahmedabad": 0.28,
    "Surat": 0.20,
    "Vadodara": 0.10,
    "Rajkot": 0.08,
    "Gandhinagar": 0.07,
    "Bharuch": 0.03,
    "Bhavnagar": 0.03,
    "Jamnagar": 0.025,
    "Junagadh": 0.025,
    "Anand": 0.025,
    "Nadiad": 0.02,
    "Mehsana": 0.02,
    "Patan": 0.018,
    "Porbandar": 0.012,
    "Surendranagar": 0.012,
    "Amreli": 0.010,
    "Kutch": 0.009,
    "Morbi": 0.008,
    "Navsari": 0.007,
    "Valsad": 0.007,
    "Vapi": 0.006,
    "Gondal": 0.005,
    "Palanpur": 0.005,
    "Godhra": 0.005,
    "Dahod": 0.005,
    "Himmatnagar": 0.005,
    "Veraval": 0.005,
    "Botad": 0.004,
    "Bardoli": 0.004,
    "Dwarka": 0.003,
    "Khambhat": 0.003,
    "Jetpur": 0.003,
    "Una": 0.003,
}

SECTORS = [
    ("IT Services", 0.12),
    ("Artificial Intelligence", 0.08),
    ("E-commerce", 0.07),
    ("Healthcare", 0.06),
    ("Education", 0.05),
    ("Food & Beverages", 0.05),
    ("Agriculture & AgriTech", 0.05),
    ("Manufacturing", 0.05),
    ("Fintech", 0.05),
    ("SaaS", 0.04),
    ("Logistics & Supply Chain", 0.04),
    ("Real Estate & Construction", 0.04),
    ("Retail", 0.03),
    ("Transportation", 0.03),
    ("Textiles & Apparel", 0.03),
    ("Renewable Energy", 0.03),
    ("CleanTech", 0.025),
    ("Media & Entertainment", 0.025),
    ("Travel & Tourism", 0.02),
    ("Fashion & Lifestyle", 0.02),
    ("Automotive", 0.02),
    ("Biotechnology", 0.015),
    ("Chemicals & Petrochemicals", 0.015),
    ("Telecom", 0.012),
    ("Gaming & Esports", 0.012),
    ("EdTech", 0.01),
    ("LegalTech", 0.01),
    ("Blockchain & Web3", 0.01),
    ("Cybersecurity", 0.008),
    ("SpaceTech & Drones", 0.005),
]

INDUSTRIES = [
    "IT Software & Services",
    "AI & Machine Learning",
    "E-Commerce & Online Marketplace",
    "Health & Wellness",
    "Education & Skill Development",
    "Food Processing & Packaging",
    "Agriculture & Allied Services",
    "Industrial Manufacturing",
    "Financial Services & Insurance",
    "Cloud Computing & SaaS",
    "Logistics & Warehousing",
    "Real Estate & Housing",
    "Retail & Consumer Goods",
    "Transport & Mobility",
    "Textiles & Garments",
    "Energy & Utilities",
    "Environmental Services",
    "Digital Media & Content",
    "Hospitality & Travel",
    "Fashion & Accessories",
    "Automobile & Components",
    "Life Sciences & Pharmaceuticals",
    "Chemicals & Dyes",
    "Telecommunications",
    "Gaming & Interactive Media",
    "Social Impact & NGO",
    "Legal & Regulatory Services",
    "Cybersecurity & Risk",
    "Aerospace & Defence",
    "Biotechnology",
    "Jewellery & Precious Metals",
    "Paper & Publishing",
    "Rubber & Plastics",
    "Glass & Ceramics",
    "Cement & Building Materials",
    "Metals & Mining",
    "Fisheries & Aquaculture",
    "Dairy & Livestock",
    "Forestry & Timber",
    "Handicrafts & Art",
    "Home Furnishing",
    "Sports & Fitness",
    "Events & Conferencing",
    "Consulting & Advisory",
    "Human Resources & Staffing",
    "Marketing & Advertising",
    "Architecture & Interior Design",
    "Photography & Videography",
    "Security & Surveillance",
    "Water & Sanitation",
    "Waste Management",
    "Printing & Packaging",
    "Furniture & Interiors",
    "Precision Engineering",
    "Robotics & Automation",
    "Semiconductor & Electronics",
]

PREFIXES = [
    "Inno", "Green", "Swift", "Bright", "Nova", "Apex", "Zen", "Neo", "Cyber",
    "Agri", "Fin", "Medi", "Edu", "Tech", "Bio", "Logi", "Urban", "Eco",
    "Cloud", "Data", "Smart", "Pure", "Rapid", "Vibrant", "Orbit", "Prime",
    "Alpha", "Delta", "Spark", "Lumina", "Nexa", "Ultra", "Core", "NexGen",
    "Gen", "Max", "Omni", "Pro", "Vibe", "Flux", "Aura", "Edge", "Digi",
    "Pixel", "Quantum", "Blue", "Red", "Terra", "Solar", "Hydro", "Solaris",
    "Aero", "Astro", "Bolt", "Bridge", "Catalyst", "Compass", "Crux",
    "Fusion", "Gear", "Helix", "Hyper", "Impact", "Infinity", "Iris",
    "Karma", "Launch", "Loop", "Momentum", "Nimble", "Path", "Pioneer",
    "Pulse", "Quest", "Rise", "Roots", "Sage", "Scale", "Spectrum",
    "Summit", "Synth", "Thrive", "Trident", "True", "Upward",
    "Velocity", "Vertex", "Voyage", "Wave", "Xeno", "Zeal", "Zyphr",
]

MIDDLES = [
    "Tech", "Labs", "Works", "Solutions", "Systems", "Digital", "Networks",
    "Hub", "Point", "Logic", "Craft", "Force", "Link", "Mind",
    "Space", "Stack", "Base", "Dynamics", "Nexus", "Verse", "Wing",
    "Flow", "Shift", "Byte", "Codex", "Pixel",
]

SUFFIXES = [
    "Private Limited",
    "Pvt. Ltd.",
    "Private Ltd.",
    "Pvt Ltd",
    "OPC Private Limited",
    "OPC Pvt. Ltd.",
    "LLP",
]

SERVICES_POOL = [
    "Platform", "SaaS", "Consulting", "Marketplace", "Subscription",
    "On-Demand", "B2B", "B2C", "D2C", "API-First", "White-Label",
    "Freemium", "Managed Services", "Custom Development", "Data Analytics",
    "Cloud Services", "Mobile App", "Web Platform", "IoT Solution",
    "AI-Powered", "Blockchain-Based", "AR/VR Experience",
]

FOCUS_SECTORS = {
    "IT Services": ["Enterprise IT", "IT Consulting", "IT Infrastructure", "DevOps"],
    "Artificial Intelligence": ["Machine Learning", "NLP", "Computer Vision", "Generative AI"],
    "E-commerce": ["Online Marketplace", "D2C Platform", "B2B Marketplace", "Social Commerce"],
    "Healthcare": ["Telemedicine", "Health Records", "Diagnostics", "MedTech"],
    "Education": ["K-12 Learning", "Higher Ed", "Vocational Training", "Skill Development"],
    "Food & Beverages": ["Food Delivery", "Food Processing", "Cloud Kitchen", "Organic Food"],
    "Agriculture & AgriTech": ["Farm Solutions", "Agri-Logistics", "Crop Analytics", "Agri-Marketplace"],
    "Manufacturing": ["Smart Manufacturing", "3D Printing", "Industrial IoT", "Quality Control"],
    "Fintech": ["Digital Payments", "Lending", "Wealth Management", "Insurance Tech"],
    "SaaS": ["CRM SaaS", "HR Tech", "ERP Solutions", "Project Management"],
    "Logistics & Supply Chain": ["Last-Mile Delivery", "Warehousing", "Fleet Management", "Cold Chain"],
    "Real Estate & Construction": ["PropTech", "Construction Tech", "Co-Living", "Smart Spaces"],
    "Retail": ["Omnichannel Retail", "POS Systems", "Retail Analytics", "Smart Checkout"],
    "Transportation": ["Ride Hailing", "Mobility Solutions", "EV Infrastructure", "Public Transit"],
    "Textiles & Apparel": ["Fashion Tech", "Textile Manufacturing", "Apparel D2C", "Sustainable Fashion"],
    "Renewable Energy": ["Solar Energy", "Wind Energy", "Energy Storage", "Micro-Grid"],
    "CleanTech": ["Waste Management", "Water Tech", "Air Quality", "Sustainability"],
    "Media & Entertainment": ["OTT Platform", "Content Creation", "Digital Media", "Music Tech"],
    "Travel & Tourism": ["Travel Booking", "Experiential Travel", "Hospitality Tech", "Tourism Platform"],
    "Fashion & Lifestyle": ["Fashion Marketplace", "Lifestyle Brand", "Accessories", "Sustainable Fashion"],
    "Automotive": ["Auto Components", "EV Manufacturing", "Connected Vehicles", "Auto Services"],
    "Biotechnology": ["Bio Pharma", "Agricultural Biotech", "Industrial Biotech", "Bio Informatics"],
    "Chemicals & Petrochemicals": ["Specialty Chemicals", "Petrochemicals", "Green Chemistry", "Lab Solutions"],
    "Telecom": ["5G Solutions", "Network Infrastructure", "Telecom Services", "IoT Connectivity"],
    "Gaming & Esports": ["Mobile Gaming", "Esports Platform", "Game Development", "VR Gaming"],
    "EdTech": ["Online Learning", "Tutoring Platform", "Exam Prep", "LMS Solutions"],
    "LegalTech": ["Legal Compliance", "Contract Management", "Legal Research", "Dispute Resolution"],
    "Blockchain & Web3": ["DeFi", "NFT Platform", "Smart Contracts", "Web3 Infrastructure"],
    "Cybersecurity": ["Threat Detection", "Data Protection", "Network Security", "Identity Management"],
    "SpaceTech & Drones": ["Drone Services", "Satellite Data", "Space Analytics", "UAV Manufacturing"],
}

YEAR_WEIGHTS = {
    2016: 0.03,
    2017: 0.04,
    2018: 0.06,
    2019: 0.08,
    2020: 0.10,
    2021: 0.18,
    2022: 0.17,
    2023: 0.14,
    2024: 0.12,
    2025: 0.08,
}

COMPANY_STATUSES = [
    ("Active", 0.50),
    ("Scaling", 0.15),
    ("Early Traction", 0.15),
    ("Validation", 0.10),
    ("Prototype", 0.10),
]

DOMAINS = [".com", ".in", ".io", ".co", ".tech", ".org", ".net"]


def generate_company_name(idx):
    prefix = random.choice(PREFIXES)
    middle = random.choice(MIDDLES)
    suffix = random.choice(SUFFIXES)
    if idx >= 15000:
        prefix = random.choice(PREFIXES) + random.choice(PREFIXES)
    elif idx >= 10000:
        num = random.randint(10, 99)
        prefix = prefix + str(num)
    return f"{prefix}{middle} {suffix}"


def generate_website(company_name):
    if random.random() > 0.57:
        return ""
    parts = company_name.split()
    name_part = parts[0].lower()
    name_part = name_part.replace(".", "").replace(",", "")
    domain = random.choice(DOMAINS)
    return f"www.{name_part}{domain}"


def generate_cin(year):
    listing_type = random.choice(["U", "L"])
    industry_code = random.randint(10000, 99999)
    company_type = random.choice(["PTC", "OPC", "LLP"])
    serial = random.randint(100000, 999999)
    return f"{listing_type}{industry_code}GJ{year}{company_type}{serial}"


def main():
    district_names = list(DISTRICTS.keys())
    district_weights = list(DISTRICTS.values())
    sector_names = [s[0] for s in SECTORS]
    sector_weights = [s[1] for s in SECTORS]
    year_names = list(YEAR_WEIGHTS.keys())
    year_weights = list(YEAR_WEIGHTS.values())
    status_names = [s[0] for s in COMPANY_STATUSES]
    status_weights = [s[1] for s in COMPANY_STATUSES]
    industry_names = list(INDUSTRIES)

    districts = random.choices(district_names, weights=district_weights, k=TOTAL_RECORDS)
    sectors = random.choices(sector_names, weights=sector_weights, k=TOTAL_RECORDS)
    years = random.choices(year_names, weights=year_weights, k=TOTAL_RECORDS)
    statuses = random.choices(status_names, weights=status_weights, k=TOTAL_RECORDS)

    print(f"Generating {TOTAL_RECORDS} startup records...")

    rows = []
    used_names = set()

    for i in range(TOTAL_RECORDS):
        city = districts[i]
        sector = sectors[i]
        year = years[i]
        status = statuses[i]

        while True:
            company_name = generate_company_name(i)
            if company_name not in used_names:
                used_names.add(company_name)
                break

        cin = generate_cin(year)
        website = generate_website(company_name)
        industry = random.choice(industry_names)
        focus_sector = random.choice(FOCUS_SECTORS.get(sector, [sector]))
        num_services = random.randint(1, 4)
        services = ", ".join(random.sample(SERVICES_POOL, k=num_services))

        rows.append({
            "data_as_on": DATA_AS_ON,
            "state": "Gujarat",
            "city": city,
            "company_name": company_name,
            "legal_name": company_name,
            "cin": cin,
            "company_website": website,
            "company_status": status,
            "focus_industry": industry,
            "focus_sector": focus_sector,
            "services_provided": services,
        })

    print(f"Writing {len(rows)} records to {OUTPUT_PATH}...")

    fieldnames = [
        "data_as_on", "state", "city", "company_name", "legal_name",
        "cin", "company_website", "company_status", "focus_industry",
        "focus_sector", "services_provided",
    ]

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nCSV written to: {OUTPUT_PATH}")
    print(f"Total records: {len(rows)}")

    print("\n--- District Distribution ---")
    district_counts = Counter(r["city"] for r in rows)
    for d, c in sorted(district_counts.items(), key=lambda x: -x[1]):
        pct = c / len(rows) * 100
        print(f"  {d:20s}: {c:6d} ({pct:.1f}%)")

    print("\n--- Sector Distribution ---")
    sector_counts = Counter(r["focus_sector"] for r in rows)
    for s, c in sorted(sector_counts.items(), key=lambda x: -x[1]):
        pct = c / len(rows) * 100
        print(f"  {s:30s}: {c:6d} ({pct:.1f}%)")

    print("\n--- Status Distribution ---")
    status_counts = Counter(r["company_status"] for r in rows)
    for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
        pct = c / len(rows) * 100
        print(f"  {s:20s}: {c:6d} ({pct:.1f}%)")

    print("\n--- CIN Year Distribution ---")
    year_dist = Counter()
    for r in rows:
        yr = r["cin"][8:12]
        try:
            year_dist[int(yr)] += 1
        except ValueError:
            year_dist[0] += 1
    for y, c in sorted(year_dist.items()):
        pct = c / len(rows) * 100
        print(f"  {y}: {c:6d} ({pct:.1f}%)")

    print("\n--- Website Coverage ---")
    with_site = sum(1 for r in rows if r["company_website"])
    pct = with_site / len(rows) * 100
    print(f"  With website: {with_site} ({pct:.1f}%)")
    print(f"  Without website: {len(rows) - with_site} ({100 - pct:.1f}%)")

    print("\nDone!")


if __name__ == "__main__":
    main()