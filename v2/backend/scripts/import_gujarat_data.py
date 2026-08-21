#!/usr/bin/env python3
"""
Gujarat DPIIT Startup Data Importer
Reads CSV from DPIIT/DPIIT datasets and imports to PostgreSQL.

Usage:
    python import_gujarat_data.py --csv path/to/startups.csv
    python import_gujarat_data.py --sample  (creates 200 Gujarat startup records)
"""

import csv
import argparse
import sys
import os
from datetime import datetime, timedelta
import random

# Add parent dir to path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models.models import Base, User, Entity, EntityKind, AuditLog

GUJARAT_DISTRICTS = [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch",
    "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka",
    "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda",
    "Mahesana", "Mahisagar", "Morbi", "Narmada", "Navsari", "Panchmahal",
    "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
    "Tapi", "Vadodara", "Valsad"
]

GUJARAT_SECTORS = [
    "AgriTech", "CleanTech", "HealthTech", "FinTech", "AI_ML", "EdTech",
    "Biotech", "FoodTech", "Textiles", "Pharma", "Manufacturing", "Energy",
    "Logistics", "Retail", "Media", "IoT", "Cybersecurity", "WaterTech",
    "WasteManagement", "Other"
]

STARTUP_DOMAINS = {
    "AgriTech": ["Crop Monitoring", "Precision Agriculture", "Farm Equipment", "Supply Chain", "Cold Storage", "Irrigation", "Soil Health", "Marketplace"],
    "CleanTech": ["Solar Energy", "Wind Energy", "EV Charging", "Carbon Capture", "Green Building", "Waste Management", "Recycling", "Air Purification"],
    "HealthTech": ["Telemedicine", "Diagnostics", "Pharma", "Medical Devices", "Health Records", "Mental Health", "Pathology", "Wearables"],
    "FinTech": ["Payments", "Lending", "Insurance", "Wealth Management", "Blockchain", "UPI", "Microfinance", "Accounting"],
    "AI_ML": ["NLP", "Computer Vision", "Predictive Analytics", "Robotics", "Chatbots", "Automation", "Deep Learning", "MLOps"],
    "EdTech": ["Online Learning", "Skill Development", "Tutoring", "Assessment", "Content", "LMS", "VR Learning", "Language"],
    "FoodTech": ["Food Delivery", "Cloud Kitchen", "Food Processing", "Packaging", "Quality", "Organic", "Preservation", "Cold Chain"],
    "Textiles": ["Fashion", "Sustainable", "Manufacturing", "Export", "Handloom", "Design", "Dyeing", "E-commerce"],
    "Manufacturing": ["3D Printing", "Automation", "Quality Control", "CNC", "Assembly", "Material", "IoT Sensors", "Robotics"],
    "Energy": ["Solar", "Wind", "Biomass", "Hydrogen", "Storage", "Grid", "Microgrid", "Efficiency"],
}

GROWTH_STAGES = [
    ("Idea", 5), ("Prototype", 8), ("MVP", 12), ("Pilot", 15),
    ("Early Traction", 20), ("Growth", 25), ("Scaling", 10)
]

STATUS_OPTIONS = ["Active", "Active", "Active", "Active", "Pivoted", "Inactive"]


def seed_admin_user(session):
    """Ensure the demo admin user exists."""
    admin = session.query(User).filter(User.email == "admin@udaansetu.demo").first()
    if not admin:
        admin = User(
            email="admin@udaansetu.demo",
            hashed_password=hash_password("Demo@123"),
            name="Demo Administrator",
            role="admin",
            district="Ahmedabad",
            organization="UdaanSetu Platform",
            is_active=True,
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)
    return admin


def parse_csv(csv_path):
    """Parse DPIIT-format CSV. Returns list of dicts."""
    records = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        # Normalize headers
        headers = [h.strip().lower().replace(' ', '_') for h in headers]

        for row in reader:
            # Normalize keys
            row = {k.strip().lower().replace(' ', '_'): v.strip() for k, v in row.items()}

            # Try to map common DPIIT fields
            name = row.get('startup_name', row.get('entity_name', row.get('name', row.get('startup_name_with_initials', ''))))
            district = row.get('city', row.get('district', row.get('location', '')))
            sector = row.get('sector', row.get('industry', row.get('industry_segment', '')))
            date_str = row.get('date_of_recognition', row.get('recognition_date', row.get('date', '')))
            status = row.get('status', 'Active')

            if not name:
                continue

            # Map Gujarat districts
            if district:
                matched = None
                for d in GUJARAT_DISTRICTS:
                    if d.lower() in district.lower() or district.lower() in d.lower():
                        matched = d
                        break
                district = matched or random.choice(GUJARAT_DISTRICTS)
            else:
                district = random.choice(GUJARAT_DISTRICTS)

            # Map sector
            if sector:
                matched = None
                for s in GUJARAT_SECTORS:
                    if s.lower().replace('_', ' ') in sector.lower() or sector.lower() in s.lower().replace('_', ' '):
                        matched = s
                        break
                sector = matched or random.choice(GUJARAT_SECTORS)
            else:
                sector = random.choice(GUJARAT_SECTORS)

            # Parse date
            recognition_date = None
            if date_str:
                for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
                    try:
                        recognition_date = datetime.strptime(date_str, fmt)
                        break
                    except ValueError:
                        continue

            records.append({
                'name': name,
                'district': district,
                'sector': sector,
                'recognition_date': recognition_date,
                'status': status,
                'raw': row,
            })

    return records


def generate_sample_data(count=200):
    """Generate realistic Gujarat startup sample data."""
    records = []
    names = [
        "GreenFarm Solutions", "SolarTech Gujarat", "MediCare Health", "PayEasy FinServ",
        "AgriBot AI", "CleanWater Systems", "EduLearn Platform", "FoodFresh Logistics",
        "SmartGrid Energy", "TextileHub Digital", "BioGen Research", "LogiTrack Supply",
        "RetailMAX", "MediaStream Digital", "IoTConnect Gujarat", "CyberShield Security",
        "WindPower Gujarat", "CarbonZero Solutions", "PharmaTech Innovations", "CloudKitchen360",
        "FarmLink Direct", "SunEnergy Gujarat", "HealthPulse Diagnostics", "LendSmart AI",
        "CropSense Precision", "EcoBuild Green", "LearnHub Online", "FreshBox Organic",
        "MicroGrid Solutions", "FabricFlow Textiles", "GeneTech Labs", "SwiftCargo Logistics",
        "ShopEasy Marketplace", "ContentPro Media", "SensorNet IoT", "SecureNet Cyber",
        "BioFuel Gujarat", "RecyclePro Waste", "AirPure Systems", "3DPrint India",
        "DroneAgri Gujarat", "VR Learn Academy", "FoodSafe Packaging", "QualityCheck AI",
        "EnergyStore Batteries", "AgriSupply Chain", "MediDeliver Health", "PayPoint Gujarat",
        "SmartIrrigation Tech", "GreenRecycle Corp", "SoilHealth Analytics", "MarketConnect Farm",
        "PrecisionPlanting", "SmartDairy Tech", "HealthCare Connect", "MicroLend India",
        "CropGuard AI", "CleanAir Gujarat", "EduSmart India", "FoodSecure Systems",
        "GridOptimize Energy", "HandloomHub Gujarat", "BioPharma Solutions", "FleetTrack India",
        "DigitalRetail India", "VideoStream Media", "SmartSensors Gujarat", "DataGuard Security",
        "SolarPanel Gujarat", "WaterPurify Tech", "PharmaDeliver India", "InsuranceTech Gujarat",
        "FarmRobotics", "EVCharging India", "TeleHealth Gujarat", "WealthTech India",
        "AgriDrone Gujarat", "GreenBuilding India", "SkillUp Gujarat", "FoodTech Processing",
        "Biomass Gujarat", "FashionTech India", "Biotech Gujarat", "MicroGrid Gujarat",
        "IoT Gujarat", "CloudServices India", "3DModel Gujarat", "VR Gujarat",
        "SmartFactory Gujarat", "Digital Gujarat", "Cyber Gujarat", "Energy Gujarat",
        "Farm Gujarat", "Health Gujarat", "Edu Gujarat", "Food Gujarat",
    ]

    descriptions = [
        "AI-powered precision agriculture platform for Gujarat farmers",
        "Solar energy solutions for rural Gujarat communities",
        "Telemedicine platform connecting rural patients with doctors",
        "Digital lending platform for small businesses",
        "Autonomous drones for crop monitoring",
        "Water purification technology for rural Gujarat",
        "Online learning platform for Gujarat schools",
        "Farm-to-table supply chain optimization",
        "Smart grid energy management system",
        "Digital textile marketplace connecting weavers with buyers",
        "Biotechnology research for crop improvement",
        "Logistics platform for agricultural produce",
        "Retail technology for kirana stores",
        "Digital media platform for Gujarat content",
        "IoT sensors for industrial monitoring",
        "Cybersecurity solutions for businesses",
        "Wind energy harvesting systems",
        "Carbon capture and offset platform",
        "Pharmaceutical distribution technology",
        "Cloud kitchen management platform",
    ]

    for i in range(count):
        name = names[i % len(names)] + (f" {i+1}" if i >= len(names) else "")
        sector = random.choice(GUJARAT_SECTORS)
        district = random.choice(GUJARAT_DISTRICTS)
        stage_idx, stage_weight = random.choice(enumerate([s[1] for s in GROWTH_STAGES]))
        stage_name = GROWTH_STAGES[stage_idx][0]

        days_ago = random.randint(30, 1500)
        recognition_date = datetime.now() - timedelta(days=days_ago)

        revenue = random.randint(500000, 50000000) if stage_idx >= 3 else random.randint(100000, 5000000)
        jobs = random.randint(5, 500) if stage_idx >= 2 else random.randint(1, 10)
        farmers = random.randint(100, 10000) if sector == "AgriTech" else 0

        records.append({
            'name': name,
            'description': random.choice(descriptions),
            'district': district,
            'sector': sector,
            'recognition_date': recognition_date,
            'status': random.choice(STATUS_OPTIONS),
            'stage': stage_name,
            'revenue': revenue,
            'jobs_created': jobs,
            'farmers_reached': farmers,
        })

    return records


def import_records(session, records, owner_id):
    """Import records into database."""
    created = 0
    for rec in records:
        entity = Entity(
            kind=EntityKind.startup,
            title=rec['name'],
            description=rec.get('description', f"Gujarat-based {rec['sector']} startup"),
            stage=rec.get('stage', random.choice([s[0] for s in GROWTH_STAGES])),
            sector=rec['sector'],
            district=rec['district'],
            is_demo=True,
            owner_id=owner_id,
            meta={
                'recognition_date': rec['recognition_date'].isoformat() if rec.get('recognition_date') else None,
                'status': rec.get('status', 'Active'),
                'revenue': rec.get('revenue', 0),
                'jobs_created': rec.get('jobs_created', 0),
                'farmers_reached': rec.get('farmers_reached', 0),
                'source': 'DPIIT Gujarat Dataset',
                'imported_at': datetime.now().isoformat(),
            },
        )
        session.add(entity)
        created += 1

        if created % 50 == 0:
            session.commit()

    session.commit()
    return created


def main():
    parser = argparse.ArgumentParser(description='Import Gujarat startup data')
    parser.add_argument('--csv', type=str, help='Path to CSV file')
    parser.add_argument('--sample', action='store_true', help='Generate 200 sample Gujarat records')
    parser.add_argument('--count', type=int, default=200, help='Number of sample records (default: 200)')
    args = parser.parse_args()

    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        Base.metadata.create_all(bind=engine)
        admin = seed_admin_user(db)

        if args.csv:
            print(f"Reading CSV: {args.csv}")
            records = parse_csv(args.csv)
            print(f"Parsed {len(records)} records from CSV")
        elif args.sample:
            print(f"Generating {args.count} sample Gujarat records...")
            records = generate_sample_data(args.count)
        else:
            print("Usage: python import_gujarat_data.py --csv startups.csv")
            print("       python import_gujarat_data.py --sample")
            sys.exit(1)

        count = import_records(db, records, admin.id)
        print(f"Imported {count} records as startup entities")

        # Log to audit
        audit = AuditLog(
            action='seeded',
            entity_type='system',
            entity_id=0,
            actor_id=admin.id,
            detail={'message': f'Gujarat data import: {count} records', 'source': args.csv or 'sample'},
        )
        db.add(audit)
        db.commit()
        print("Done!")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()
