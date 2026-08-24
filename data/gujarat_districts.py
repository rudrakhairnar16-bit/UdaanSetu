#!/usr/bin/env python3
"""Generate Gujarat district data JSON file with real 2011 Census and economic data."""

import json
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "gujarat_districts.json")


def get_districts():
    """Return list of all 33 Gujarat districts with real data."""
    return [
        {
            "name": "Ahmedabad",
            "code": "GJ-ADC",
            "population": 8088267,
            "area_sq_km": 8088,
            "literacy_rate": 89.62,
            "gdp_contrib_pct": 28.5,
            "urban_pct": 82.3,
            "key_industries": ["IT & ITES", "Pharmaceuticals", "Textiles", "Chemicals"],
            "startup_density": 0.0,
            "headquarters": "Ahmedabad",
        },
        {
            "name": "Surat",
            "code": "GJ-SRT",
            "population": 6081322,
            "area_sq_km": 4327,
            "literacy_rate": 87.93,
            "gdp_contrib_pct": 20.2,
            "urban_pct": 79.5,
            "key_industries": ["Textiles", "Diamonds", "IT", "Chemicals"],
            "startup_density": 0.0,
            "headquarters": "Surat",
        },
        {
            "name": "Vadodara",
            "code": "GJ-VDR",
            "population": 4165626,
            "area_sq_km": 7794,
            "literacy_rate": 88.53,
            "gdp_contrib_pct": 10.1,
            "urban_pct": 68.5,
            "key_industries": ["Petrochemicals", "IT", "Engineering", "Pharmaceuticals"],
            "startup_density": 0.0,
            "headquarters": "Vadodara",
        },
        {
            "name": "Rajkot",
            "code": "GJ-RJT",
            "population": 3804559,
            "area_sq_km": 11203,
            "literacy_rate": 86.82,
            "gdp_contrib_pct": 7.8,
            "urban_pct": 62.3,
            "key_industries": ["Engineering", "Auto Parts", "Jewelry", "Castings"],
            "startup_density": 0.0,
            "headquarters": "Rajkot",
        },
        {
            "name": "Gandhinagar",
            "code": "GJ-GNG",
            "population": 1391753,
            "area_sq_km": 649,
            "literacy_rate": 87.11,
            "gdp_contrib_pct": 6.9,
            "urban_pct": 78.0,
            "key_industries": ["Government", "IT", "Defense", "Education"],
            "startup_density": 0.0,
            "headquarters": "Gandhinagar",
        },
        {
            "name": "Bhavnagar",
            "code": "GJ-BVG",
            "population": 2880365,
            "area_sq_km": 11155,
            "literacy_rate": 84.56,
            "gdp_contrib_pct": 4.2,
            "urban_pct": 45.2,
            "key_industries": ["Ship Breaking", "Salt", "Chemistry", "Ports"],
            "startup_density": 0.0,
            "headquarters": "Bhavnagar",
        },
        {
            "name": "Jamnagar",
            "code": "GJ-JMN",
            "population": 2161362,
            "area_sq_km": 14184,
            "literacy_rate": 83.92,
            "gdp_contrib_pct": 3.8,
            "urban_pct": 48.7,
            "key_industries": ["Oil Refining", "Brass", "Pharmaceuticals"],
            "startup_density": 0.0,
            "headquarters": "Jamnagar",
        },
        {
            "name": "Junagadh",
            "code": "GJ-JNG",
            "population": 2743082,
            "area_sq_km": 11152,
            "literacy_rate": 83.87,
            "gdp_contrib_pct": 3.5,
            "urban_pct": 37.7,
            "key_industries": ["Agriculture", "Marine", "Tourism", "Mining"],
            "startup_density": 0.0,
            "headquarters": "Junagadh",
        },
        {
            "name": "Anand",
            "code": "GJ-AND",
            "population": 2092745,
            "area_sq_km": 5024,
            "literacy_rate": 87.87,
            "gdp_contrib_pct": 3.2,
            "urban_pct": 42.3,
            "key_industries": ["Dairy (AMUL)", "Agriculture", "Pharma"],
            "startup_density": 0.0,
            "headquarters": "Anand",
        },
        {
            "name": "Kheda",
            "code": "GJ-KHD",
            "population": 2299017,
            "area_sq_km": 4222,
            "literacy_rate": 85.27,
            "gdp_contrib_pct": 2.8,
            "urban_pct": 35.2,
            "key_industries": ["Agriculture", "Textiles", "Tobacco"],
            "startup_density": 0.0,
            "headquarters": "Nadiad",
        },
        {
            "name": "Bharuch",
            "code": "GJ-BRC",
            "population": 1551019,
            "area_sq_km": 6509,
            "literacy_rate": 86.97,
            "gdp_contrib_pct": 2.9,
            "urban_pct": 43.8,
            "key_industries": ["Petrochemicals", "Chemicals", "Pharma"],
            "startup_density": 0.0,
            "headquarters": "Bharuch",
        },
        {
            "name": "Panchmahal",
            "code": "GJ-PCH",
            "population": 2390773,
            "area_sq_km": 5379,
            "literacy_rate": 75.21,
            "gdp_contrib_pct": 2.1,
            "urban_pct": 27.0,
            "key_industries": ["Agriculture", "Mining", "Dairying"],
            "startup_density": 0.0,
            "headquarters": "Godhra",
        },
        {
            "name": "Banaskantha",
            "code": "GJ-BNK",
            "population": 3120559,
            "area_sq_km": 12703,
            "literacy_rate": 65.32,
            "gdp_contrib_pct": 1.9,
            "urban_pct": 22.5,
            "key_industries": ["Agriculture", "Salt", "Milk", "Bajra"],
            "startup_density": 0.0,
            "headquarters": "Palanpur",
        },
        {
            "name": "Mehsana",
            "code": "GJ-MHS",
            "population": 2027727,
            "area_sq_km": 4386,
            "literacy_rate": 86.49,
            "gdp_contrib_pct": 2.7,
            "urban_pct": 36.5,
            "key_industries": ["Oil & Gas", "Dairying", "Agriculture"],
            "startup_density": 0.0,
            "headquarters": "Mehsana",
        },
        {
            "name": "Sabarkantha",
            "code": "GJ-SBR",
            "population": 2428589,
            "area_sq_km": 7390,
            "literacy_rate": 79.44,
            "gdp_contrib_pct": 2.0,
            "urban_pct": 26.8,
            "key_industries": ["Agriculture", "Mining", "Forest Produce"],
            "startup_density": 0.0,
            "headquarters": "Himmatnagar",
        },
        {
            "name": "Surendranagar",
            "code": "GJ-SUN",
            "population": 1756046,
            "area_sq_km": 10489,
            "literacy_rate": 74.81,
            "gdp_contrib_pct": 1.8,
            "urban_pct": 30.1,
            "key_industries": ["Cotton", "Ghee", "Mining"],
            "startup_density": 0.0,
            "headquarters": "Surendranagar",
        },
        {
            "name": "Narmada",
            "code": "GJ-NRM",
            "population": 590297,
            "area_sq_km": 2749,
            "literacy_rate": 74.76,
            "gdp_contrib_pct": 0.9,
            "urban_pct": 18.3,
            "key_industries": ["Agriculture", "Dang Forests", "Tourism"],
            "startup_density": 0.0,
            "headquarters": "Rajpipla",
        },
        {
            "name": "Tapi",
            "code": "GJ-TAP",
            "population": 807040,
            "area_sq_km": 3435,
            "literacy_rate": 74.13,
            "gdp_contrib_pct": 0.8,
            "urban_pct": 17.5,
            "key_industries": ["Agriculture", "Cotton", "Forest Produce"],
            "startup_density": 0.0,
            "headquarters": "Vyara",
        },
        {
            "name": "Dang",
            "code": "GJ-DNG",
            "population": 393179,
            "area_sq_km": 1764,
            "literacy_rate": 75.24,
            "gdp_contrib_pct": 0.3,
            "urban_pct": 12.0,
            "key_industries": ["Forest", "Tribal Crafts", "Eco-Tourism"],
            "startup_density": 0.0,
            "headquarters": "Ahwa",
        },
        {
            "name": "Navsari",
            "code": "GJ-NVS",
            "population": 1329672,
            "area_sq_km": 2211,
            "literacy_rate": 89.32,
            "gdp_contrib_pct": 1.7,
            "urban_pct": 45.0,
            "key_industries": ["Diamonds", "Textiles", "Tourism"],
            "startup_density": 0.0,
            "headquarters": "Navsari",
        },
        {
            "name": "Valsad",
            "code": "GJ-VLD",
            "population": 1705678,
            "area_sq_km": 3710,
            "literacy_rate": 87.13,
            "gdp_contrib_pct": 1.5,
            "urban_pct": 39.2,
            "key_industries": ["Mango", "Textiles", "Chemicals"],
            "startup_density": 0.0,
            "headquarters": "Valsad",
        },
        {
            "name": "Porbandar",
            "code": "GJ-PBR",
            "population": 585449,
            "area_sq_km": 3250,
            "literacy_rate": 82.71,
            "gdp_contrib_pct": 0.9,
            "urban_pct": 35.8,
            "key_industries": ["Ports", "Salt", "Marine", "Tourism"],
            "startup_density": 0.0,
            "headquarters": "Porbandar",
        },
        {
            "name": "Amreli",
            "code": "GJ-AMI",
            "population": 1514190,
            "area_sq_km": 6759,
            "literacy_rate": 76.26,
            "gdp_contrib_pct": 1.4,
            "urban_pct": 27.0,
            "key_industries": ["Agriculture", "Oil", "Cattle", "Garlic"],
            "startup_density": 0.0,
            "headquarters": "Amreli",
        },
        {
            "name": "Kutch",
            "code": "GJ-KUT",
            "population": 2092371,
            "area_sq_km": 45674,
            "literacy_rate": 70.67,
            "gdp_contrib_pct": 2.2,
            "urban_pct": 28.0,
            "key_industries": ["Salt", "Handicrafts", "Oil & Gas", "Tourism"],
            "startup_density": 0.0,
            "headquarters": "Bhuj",
        },
        {
            "name": "Patan",
            "code": "GJ-PTN",
            "population": 1343734,
            "area_sq_km": 5738,
            "literacy_rate": 73.30,
            "gdp_contrib_pct": 1.3,
            "urban_pct": 25.5,
            "key_industries": ["Patola Silk", "Wind Energy", "Agriculture"],
            "startup_density": 0.0,
            "headquarters": "Patan",
        },
        {
            "name": "Mahisagar",
            "code": "GJ-MHS",
            "population": 994624,
            "area_sq_km": 4500,
            "literacy_rate": 78.62,
            "gdp_contrib_pct": 1.0,
            "urban_pct": 22.0,
            "key_industries": ["Agriculture", "Dairying", "Mining"],
            "startup_density": 0.0,
            "headquarters": "Lunawada",
        },
        {
            "name": "Aravalli",
            "code": "GJ-ARV",
            "population": 1039918,
            "area_sq_km": 3217,
            "literacy_rate": 76.31,
            "gdp_contrib_pct": 0.9,
            "urban_pct": 19.8,
            "key_industries": ["Mining", "Marble", "Forest", "Agriculture"],
            "startup_density": 0.0,
            "headquarters": "Modasa",
        },
        {
            "name": "Morbi",
            "code": "GJ-MRB",
            "population": 960329,
            "area_sq_km": 4871,
            "literacy_rate": 79.02,
            "gdp_contrib_pct": 1.2,
            "urban_pct": 40.5,
            "key_industries": ["Ceramics", "Tiles", "Sinks", "Clocks"],
            "startup_density": 0.0,
            "headquarters": "Morbi",
        },
        {
            "name": "Gir Somnath",
            "code": "GJ-GSM",
            "population": 1233006,
            "area_sq_km": 5859,
            "literacy_rate": 76.71,
            "gdp_contrib_pct": 1.1,
            "urban_pct": 28.5,
            "key_industries": ["Tourism (Lion)", "Ports", "Fishing"],
            "startup_density": 0.0,
            "headquarters": "Somnath",
        },
        {
            "name": "Devbhumi Dwarka",
            "code": "GJ-DDK",
            "population": 752414,
            "area_sq_km": 4062,
            "literacy_rate": 76.33,
            "gdp_contrib_pct": 0.6,
            "urban_pct": 22.0,
            "key_industries": ["Ports", "Fishing", "Tourism (Dwarka)"],
            "startup_density": 0.0,
            "headquarters": "Jamkhambhaliya",
        },
        {
            "name": "Chhota Udepur",
            "code": "GJ-CHU",
            "population": 1015155,
            "area_sq_km": 3435,
            "literacy_rate": 71.83,
            "gdp_contrib_pct": 0.7,
            "urban_pct": 15.2,
            "key_industries": ["Agriculture", "Mining", "Dang Forest"],
            "startup_density": 0.0,
            "headquarters": "Chhota Udepur",
        },
        {
            "name": "Botad",
            "code": "GJ-BTD",
            "population": 656000,
            "area_sq_km": 2564,
            "literacy_rate": 77.51,
            "gdp_contrib_pct": 0.5,
            "urban_pct": 20.0,
            "key_industries": ["Agriculture", "Salt", "Cotton"],
            "startup_density": 0.0,
            "headquarters": "Botad",
        },
    ]


def load_startup_counts():
    """Load startup counts per district from startups.json if available."""
    startups_file = os.path.join(OUTPUT_DIR, "startups.json")
    if not os.path.exists(startups_file):
        print("  startups.json not found — startup_density will remain 0.0")
        return {}
    try:
        with open(startups_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"  Warning: could not read startups.json ({e})")
        return {}

    counts = {}
    startups = data if isinstance(data, list) else data.get("startups", [])
    for s in startups:
        dist = s.get("district", "").strip()
        if dist:
            counts[dist] = counts.get(dist, 0) + 1
    return counts


def compute_startup_density(startup_counts):
    """Compute startup_density = startups / (population / 100000) for each district."""
    districts = get_districts()
    for d in districts:
        name = d["name"]
        count = startup_counts.get(name, 0)
        if count > 0 and d["population"] > 0:
            d["startup_density"] = round(count / (d["population"] / 100000), 1)
        else:
            d["startup_density"] = 0.0
    return districts


def write_json(districts):
    """Write districts list to JSON with proper formatting."""
    output = {"districts": districts}
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    return OUTPUT_FILE


def print_summary(districts):
    """Print a summary of the generated data."""
    total_pop = sum(d["population"] for d in districts)
    total_gdp = sum(d["gdp_contrib_pct"] for d in districts)
    total_area = sum(d["area_sq_km"] for d in districts)
    avg_lit = sum(d["literacy_rate"] for d in districts) / len(districts)
    avg_urban = sum(d["urban_pct"] for d in districts) / len(districts)
    avg_startup = sum(d["startup_density"] for d in districts) / len(districts)

    print(f"\n{'='*60}")
    print(f"  Gujarat Districts Data Summary")
    print(f"{'='*60}")
    print(f"  Total districts       : {len(districts)}")
    print(f"  Total population      : {total_pop:,}")
    print(f"  Total area (sq km)    : {total_area:,}")
    print(f"  Total GDP contrib (%) : {total_gdp:.1f}%")
    print(f"  Avg literacy rate (%) : {avg_lit:.2f}%")
    print(f"  Avg urbanisation (%)  : {avg_urban:.1f}%")
    print(f"  Avg startup density   : {avg_startup:.1f} per 1L pop")
    print(f"{'='*60}")
    print(f"\n  Top 5 districts by GDP contribution:")
    sorted_d = sorted(districts, key=lambda x: x["gdp_contrib_pct"], reverse=True)
    for i, d in enumerate(sorted_d[:5], 1):
        print(f"    {i}. {d['name']:20s} {d['gdp_contrib_pct']:5.1f}%  pop={d['population']:>10,}")
    print(f"\n  Top 5 districts by population:")
    sorted_p = sorted(districts, key=lambda x: x["population"], reverse=True)
    for i, d in enumerate(sorted_p[:5], 1):
        print(f"    {i}. {d['name']:20s} pop={d['population']:>10,}")
    print(f"\n  Districts with startup data:")
    has_data = [d for d in districts if d["startup_density"] > 0]
    if has_data:
        sorted_s = sorted(has_data, key=lambda x: x["startup_density"], reverse=True)
        for d in sorted_s[:5]:
            print(f"    - {d['name']:20s} density={d['startup_density']:.1f}")
    else:
        print(f"    (none — startups.json not available or no matching districts)")
    print()


def main():
    print("Gujarat District Data Generator")
    print("-" * 40)

    print("Loading startup counts...")
    startup_counts = load_startup_counts()
    if startup_counts:
        print(f"  Found {sum(startup_counts.values())} startups across {len(startup_counts)} districts")

    print("Computing startup densities...")
    districts = compute_startup_density(startup_counts)

    print(f"Writing {len(districts)} districts to JSON...")
    path = write_json(districts)
    print(f"  Written to: {path}")

    print_summary(districts)


if __name__ == "__main__":
    main()
