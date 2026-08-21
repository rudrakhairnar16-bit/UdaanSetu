#!/usr/bin/env python3
"""
UdaanSetu v2 Seed Script
Seeds database with 200+ Gujarat innovation ecosystem records.

Usage:
    python seed.py          # Seed all demo data
    python seed.py --reset  # Drop and re-seed
"""

import sys
import os
import random
import argparse
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import hash_password
from app.models.models import Base, User, Entity, EntityKind, Milestone, Notification, AuditLog

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

STAGES = ["Ideation", "Prototype", "MVP", "Pilot", "Early Traction", "Growth", "Scaling"]
MENTOR_SPECIALIZATIONS = ["AgriTech", "CleanTech", "HealthTech", "FinTech", "Business Strategy", "IPR", "Marketing", "Technology", "Fundraising"]
SCHEME_CATEGORIES = ["Subsidy", "Grant", "Tax Benefit", "Interest Subsidy", "Patent Reimbursement", "Seed Fund", "Incubation Support", "Export Support"]
INCUBATOR_TYPES = ["University", "Corporate", "Government", "Private"]

DEMO_USERS = [
    ("admin@udaansetu.demo", "Demo Administrator", "admin", "Ahmedabad", "UdaanSetu Platform"),
    ("researcher@udaansetu.demo", "Dr. Priya Patel", "researcher", "Ahmedabad", "Gujarat Agricultural University"),
    ("mentor@udaansetu.demo", "Rajesh Kumar", "mentor", "Surat", "Startup Gujarat"),
    ("investor@udaansetu.demo", "Anjali Mehta", "investor", "Ahmedabad", "Gujarat Venture Capital"),
    ("incubator@udaansetu.demo", "CITI Incubator", "incubator", "Gandhinagar", "CITI Gandhinagar"),
]


def seed_users(session):
    users = []
    for email, name, role, district, org in DEMO_USERS:
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            users.append(existing)
            continue
        user = User(
            email=email, hashed_password=hash_password("Demo@123"),
            name=name, role=role, district=district, organization=org, is_active=True,
        )
        session.add(user)
        session.flush()
        users.append(user)
    session.commit()
    return users


def seed_research(session, owner_id, count=25):
    titles = [
        ("Solar-Powered Cold Storage for Rural Gujarat Farms", "AgriTech", "Designing a modular, solar-powered cold storage unit to reduce post-harvest losses in Gujarat's agricultural belt.", "Ahmedabad"),
        ("Water Purification Using Biochar from Cotton Stalks", "WaterTech", "Developing a low-cost water filter using biochar derived from Gujarat's cotton waste.", "Rajkot"),
        ("AI-Based Crop Disease Detection for Cotton", "AgriTech", "Training a CNN model on Gujarat cotton crop images to detect bollworm and blight early.", "Bhavnagar"),
        ("Microgrid Energy Storage for Kutch Villages", "Energy", "Designing a battery storage system for off-grid microgrids in Kutch district.", "Kachchh"),
        ("Traditional Bandhani Textile Digital Archive", "Textiles", "Digitally preserving 500+ Bandhani patterns from Gujarat's artisan communities.", "Surat"),
        ("Soil Health Monitoring Using IoT Sensors", "AgriTech", "Low-cost soil moisture and nutrient sensors for smallholder farms in South Gujarat.", "Navsari"),
        ("Biogas Optimization from Agri-Waste in Gujarat", "CleanTech", "Optimizing biogas production from cotton stalks and groundnut shells.", "Junagadh"),
        ("Mental Health Chatbot in Gujarati Language", "HealthTech", "NLP-based mental health support chatbot trained on Gujarati language data.", "Ahmedabad"),
        ("Blockchain-Based Agricultural Supply Chain Traceability", "AgriTech", "End-to-end traceability for groundnut and cotton supply chains using blockchain.", "Anand"),
        ("Affordable Prosthetics Using 3D Printing", "HealthTech", "Designing 3D-printed prosthetic limbs for underserved communities in Gujarat.", "Vadodara"),
        ("Wastewater Treatment Using Phytoremediation", "WaterTech", "Using local aquatic plants to treat textile industry wastewater in Surat.", "Surat"),
        ("Smart Irrigation System Using LoRaWAN", "AgriTech", "Long-range wireless sensors for precision irrigation in arid Saurashtra region.", "Rajkot"),
        ("Air Quality Monitoring Network for Ahmedabad", "CleanTech", "Distributed low-cost PM2.5 sensors across Ahmedabad for real-time AQI mapping.", "Ahmedabad"),
        ("Groundnut Shell Composite Building Material", "Manufacturing", "Developing composite panels from groundnut shell waste for construction.", "Junagadh"),
        ("Digital Twin for Gujarat Textile Mills", "Manufacturing", "Creating digital twins of textile manufacturing processes for optimization.", "Surat"),
        ("Elderly Care IoT Wearable for Rural Gujarat", "HealthTech", "Fall detection and health monitoring wearable for elderly in rural areas.", "Mehsana"),
        ("Solar-Powered Water Desalination for Kutch", "WaterTech", "Portable solar desalination unit for saline groundwater in Kutch.", "Kachchh"),
        ("AI-Powered Milk Quality Testing", "AgriTech", "Machine learning model for rapid milk adulteration detection using spectroscopy.", "Anand"),
        ("Waste Plastic Road Construction in Gujarat", "WasteManagement", "Recycling single-use plastic into road construction material.", "Ahmedabad"),
        ("Pharmaceutical Drone Delivery Network", "HealthTech", "Drone-based medicine delivery to remote villages in tribal Gujarat.", "Dahod"),
        ("Handloom Weaving Skill Development Platform", "EdTech", "VR-based training platform for traditional Bandhani and Patola weaving.", "Rajkot"),
        ("Carbon Credit Trading Platform for Gujarat Farmers", "CleanTech", "Enabling small farmers to earn carbon credits through sustainable practices.", "Gandhinagar"),
        ("Precision Fermentation for Gujarat Dairy", "Biotech", "Using precision fermentation to produce specialty dairy products.", "Anand"),
        ("Flood Early Warning System for South Gujarat", "IoT", "IoT-based river water level monitoring and early warning for Tapi and Narmada.", "Surat"),
        ("Organic Certification Blockchain for Gujarat", "AgriTech", "Simplifying organic certification using blockchain verification.", "Patan"),
    ]

    entities = []
    for i, (title, sector, desc, district) in enumerate(titles[:count]):
        stage = random.choice(STAGES)
        days_ago = random.randint(30, 900)
        e = Entity(
            kind=EntityKind.research, title=title, description=desc, stage=stage,
            sector=sector, district=district, is_demo=True, owner_id=owner_id,
            meta={"progress": random.randint(10, 90), "budget": random.randint(500000, 5000000)},
            created_at=datetime.now() - timedelta(days=days_ago),
        )
        session.add(e)
        session.flush()
        entities.append(e)

        # Add milestones
        for j in range(random.randint(2, 4)):
            m = Milestone(
                entity_id=e.id, title=f"Milestone {j+1} - {stage}",
                stage=random.choice(["Pending", "In Progress", "Completed"]),
                progress=random.randint(0, 100),
                due_date=datetime.now() + timedelta(days=random.randint(-30, 90)),
            )
            session.add(m)

    session.commit()
    return entities


def seed_innovations(session, owner_id, count=20):
    titles = [
        ("ThermaCrop Storage Module", "AgriTech", "Modular cold storage with phase-change materials, powered by solar and waste heat.", "Ahmedabad"),
        ("CropGuard AI Mobile App", "AgriTech", "Mobile app that identifies crop diseases from photos in Gujarati and Hindi.", "Rajkot"),
        ("AquaPure Portable Filter", "WaterTech", "Gravity-fed water filter using locally sourced biochar and silver nanoparticles.", "Bhavnagar"),
        ("TextileCycle Recycler", "Manufacturing", "Machine that recycles cotton textile waste into new yarn.", "Surat"),
        ("AgriDrone X1", "AgriTech", "Affordable agricultural drone for pesticide spraying on small farms.", "Anand"),
        ("SolarPump Pro", "Energy", "Solar-powered water pump with IoT monitoring for farm irrigation.", "Junagadh"),
        ("MediConnect Gujarat", "HealthTech", "Telemedicine kiosk for primary health centers in tribal areas.", "Dahod"),
        ("PayLocal Wallet", "FinTech", "UPI-based local payment wallet for unorganized retail.", "Ahmedabad"),
        ("SkillGujarat VR", "EdTech", "VR training modules for Gujarat's manufacturing workforce.", "Vadodara"),
        ("FoodFresh Cold Chain", "FoodTech", "Last-mile cold chain solution for perishable Gujarat produce.", "Surat"),
        ("EcoBrick Builder", "WasteManagement", "Machine that compresses plastic waste into construction bricks.", "Ahmedabad"),
        ("SmartFence Livestock", "AgriTech", "IoT-enabled virtual fence for livestock management in Kutch.", "Kachchh"),
        ("BioGasHome Unit", "CleanTech", "Compact home biogas unit for Gujarat households.", "Mehsana"),
        ("WeaveConnect Digital", "Textiles", "Digital loom controller for traditional weavers.", "Rajkot"),
        ("PharmaTrack Supply", "Pharma", "Blockchain-based pharmaceutical supply chain verification.", "Ahmedabad"),
        ("AirCool Passive HVAC", "CleanTech", "Passive cooling system for Gujarat's hot climate.", "Gandhinagar"),
        ("FarmBot Gujarat", "AgriTech", "Small-scale farming robot for seeding and weeding.", "Navsari"),
        ("WaterAudit IoT", "WaterTech", "IoT-based water usage monitoring for factories.", "Surat"),
        ("ElderWatch Wearable", "HealthTech", "GPS-enabled wearable for elderly with fall detection.", "Vadodara"),
        ("SolarRoof Tiles", "Energy", "Integrated solar roof tiles for Gujarat homes.", "Ahmedabad"),
    ]

    entities = []
    for i, (title, sector, desc, district) in enumerate(titles[:count]):
        stage = random.choice(STAGES[1:])
        days_ago = random.randint(60, 600)
        e = Entity(
            kind=EntityKind.innovation, title=title, description=desc, stage=stage,
            sector=sector, district=district, is_demo=True, owner_id=owner_id,
            meta={"funding_required": random.randint(1000000, 10000000), "trl": random.randint(3, 8)},
            created_at=datetime.now() - timedelta(days=days_ago),
        )
        session.add(e)
        session.flush()
        entities.append(e)

        for j in range(random.randint(1, 3)):
            m = Milestone(
                entity_id=e.id, title=f"Development Phase {j+1}",
                stage=random.choice(["Pending", "In Progress", "Completed"]),
                progress=random.randint(0, 100),
                due_date=datetime.now() + timedelta(days=random.randint(-20, 60)),
            )
            session.add(m)

    session.commit()
    return entities


def seed_ipr(session, owner_id, count=15):
    titles = [
        ("Solar-Powered Modular Cold Storage", "Patent", "In Filed", "AgriTech", "Ahmedabad"),
        ("Biochar Water Purification Method", "Patent", "In Examination", "WaterTech", "Rajkot"),
        ("Bandhani Pattern Digital Archive System", "Copyright", "Registered", "Textiles", "Surat"),
        ("CropGuard AI Disease Detection Model", "Patent", "Filed", "AgriTech", "Ahmedabad"),
        ("TextileCycle Recycling Machine Design", "Design", "Published", "Manufacturing", "Surat"),
        ("AgriDrone Autonomous Navigation", "Patent", "In Examination", "AgriTech", "Anand"),
        ("BioChar Filter Composition", "Patent", "In Filed", "WaterTech", "Bhavnagar"),
        ("MediConnect Telemedicine Platform", "Copyright", "Registered", "HealthTech", "Dahod"),
        ("SolarPump IoT Control System", "Patent", "Filed", "Energy", "Junagadh"),
        ("SmartFence Virtual Boundary Algorithm", "Patent", "In Examination", "AgriTech", "Kachchh"),
        ("EcoBrick Compression Method", "Patent", "In Filed", "WasteManagement", "Ahmedabad"),
        ("WeaveConnect Loom Controller", "Copyright", "Registered", "Textiles", "Rajkot"),
        ("AirCool Passive Cooling Design", "Design", "Published", "CleanTech", "Gandhinagar"),
        ("FarmBot Navigation System", "Patent", "Filed", "AgriTech", "Navsari"),
        ("PharmaTrack Blockchain Protocol", "Patent", "In Examination", "Pharma", "Ahmedabad"),
    ]

    for i, (title, ip_type, status, sector, district) in enumerate(titles[:count]):
        days_ago = random.randint(30, 1200)
        e = Entity(
            kind=EntityKind.ipr, title=f"{title} - {ip_type}",
            description=f"{ip_type} application for {title}",
            stage=status, sector=sector, district=district, is_demo=True, owner_id=owner_id,
            meta={"ip_type": ip_type, "application_number": f"IN/2026/{random.randint(100000,999999)}",
                   "filing_date": (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")},
            created_at=datetime.now() - timedelta(days=days_ago),
        )
        session.add(e)
    session.commit()


def seed_startups(session, owner_id, count=30):
    startups = [
        ("GreenFarm AgriSolutions", "AgriTech", "Ahmedabad", "Early Traction", 12000000, 45, 3200, 2500000),
        ("SolarTech Gujarat", "CleanTech", "Gandhinagar", "Growth", 8500000, 32, 0, 1800000),
        ("MediConnect Health", "HealthTech", "Surat", "MVP", 3500000, 18, 0, 500000),
        ("PayEasy Gujarat", "FinTech", "Ahmedabad", "Scaling", 25000000, 85, 0, 5200000),
        ("AgriDrone Systems", "AgriTech", "Anand", "Pilot", 2800000, 12, 800, 420000),
        ("CleanWater India", "WaterTech", "Rajkot", "Early Traction", 6700000, 28, 1500, 1400000),
        ("EduLearn Gujarat", "EdTech", "Vadodara", "Growth", 15000000, 52, 0, 3200000),
        ("TextileHub Digital", "Textiles", "Surat", "Scaling", 35000000, 120, 0, 7800000),
        ("BioGen Gujarat", "Biotech", "Ahmedabad", "MVP", 4200000, 15, 0, 800000),
        ("LogiTrack India", "Logistics", "Ahmedabad", "Early Traction", 8900000, 35, 0, 1900000),
        ("FoodFresh Gujarat", "FoodTech", "Surat", "Pilot", 5600000, 22, 600, 1100000),
        ("SmartGrid Energy", "Energy", "Ahmedabad", "Growth", 18000000, 65, 0, 3800000),
        ("RetailMAX Gujarat", "Retail", "Rajkot", "Early Traction", 7800000, 30, 0, 1600000),
        ("MediaStream Gujarat", "Media", "Ahmedabad", "MVP", 2500000, 10, 0, 500000),
        ("IoTConnect India", "IoT", "Gandhinagar", "Pilot", 4800000, 18, 200, 950000),
        ("CyberShield Gujarat", "Cybersecurity", "Ahmedabad", "Early Traction", 9200000, 38, 0, 2000000),
        ("AgriBot AI", "AI_ML", "Anand", "MVP", 3200000, 14, 500, 650000),
        ("PharmaTrack India", "Pharma", "Ahmedabad", "Growth", 22000000, 78, 0, 4600000),
        ("WindPower Gujarat", "Energy", "Kachchh", "Early Traction", 11000000, 42, 0, 2300000),
        ("HandloomHub Digital", "Textiles", "Rajkot", "Pilot", 3800000, 15, 100, 750000),
        ("FarmLink Direct", "AgriTech", "Mehsana", "Scaling", 28000000, 95, 4500, 6200000),
        ("CarbonZero Gujarat", "CleanTech", "Ahmedabad", "MVP", 4500000, 16, 0, 900000),
        ("CloudKitchen360", "FoodTech", "Surat", "Growth", 16000000, 58, 0, 3400000),
        ("RecyclePro Waste", "WasteManagement", "Ahmedabad", "Early Traction", 7500000, 30, 800, 1550000),
        ("SoilHealth Tech", "AgriTech", "Navsari", "Pilot", 3100000, 12, 600, 620000),
        ("DroneAgri Gujarat", "AgriTech", "Junagadh", "MVP", 2900000, 11, 300, 580000),
        ("SmartDairy India", "AgriTech", "Anand", "Scaling", 32000000, 110, 5000, 7100000),
        ("EcoBuild Gujarat", "CleanTech", "Gandhinagar", "Pilot", 5200000, 20, 0, 1050000),
        ("GeneTech Gujarat", "Biotech", "Ahmedabad", "Early Traction", 8800000, 33, 0, 1850000),
        ("FleetTrack India", "Logistics", "Vadodara", "Growth", 14000000, 48, 0, 3000000),
    ]

    for i, (name, sector, district, stage, revenue, jobs, farmers, funding) in enumerate(startups[:count]):
        days_ago = random.randint(60, 1500)
        e = Entity(
            kind=EntityKind.startup, title=name,
            description=f"Gujarat-based {sector} startup serving {district} and surrounding regions",
            stage=stage, sector=sector, district=district, is_demo=True, owner_id=owner_id,
            meta={"revenue": revenue, "jobs_created": jobs, "farmers_reached": farmers,
                   "funding_raised": funding, "dpiit_recognized": True,
                   "recognition_date": (datetime.now() - timedelta(days=days_ago + 30)).strftime("%Y-%m-%d"),
                   "source": "DPIIT Gujarat Dataset"},
            created_at=datetime.now() - timedelta(days=days_ago),
        )
        session.add(e)
    session.commit()


def seed_mentors(session, owner_id, count=15):
    mentors = [
        ("Dr. Kiran Desai", "AgriTech", "Ahmedabad", "Gujarat Agricultural University", "15 years in agri research"),
        ("Meera Joshi", "CleanTech", "Surat", "GreenTech Ventures", "Solar and wind energy expert"),
        ("Vikram Patel", "FinTech", "Ahmedabad", "Startup Gujarat", "Former banker, startup mentor"),
        ("Sneha Rao", "HealthTech", "Vadodara", "MedTech Innovations", "Medical device development"),
        ("Arjun Singh", "AI_ML", "Gandhinagar", "IIT Gandhinagar", "AI/ML researcher and mentor"),
        ("Pooja Sharma", "EdTech", "Rajkot", "EduGujarat Foundation", "EdTech policy expert"),
        ("Ravi Kumar", "Manufacturing", "Ahmedabad", "Make in Gujarat", "Manufacturing digitization"),
        ("Nisha Mehta", "Textiles", "Surat", "Gujarat Textile Association", "Textile industry veteran"),
        ("Sanjay Gupta", "AgriTech", "Anand", "NCDEX", "Agricultural commodities expert"),
        ("Deepa Iyer", "WaterTech", "Bhavnagar", "Gujarat Water Board", "Water resource management"),
        ("Amit Shah", "Energy", "Kachchh", "Gujarat Energy Dev Agency", "Renewable energy specialist"),
        ("Leena Joshi", "Biotech", "Ahmedabad", "Gujarat Biotech Research Center", "Biotechnology researcher"),
        ("Prakash Verma", "Logistics", "Vadodara", "Gujarat Logistics Hub", "Supply chain expert"),
        ("Kavita Desai", "IPR", "Ahmedabad", "IP Law Associates", "Patent attorney and IP strategy"),
        ("Rajiv Misra", "Fundraising", "Mumbai", "Venture Catalysts", "Angel investor and mentor"),
    ]

    for i, (name, spec, district, org, bio) in enumerate(mentors[:count]):
        e = Entity(
            kind=EntityKind.mentor, title=f"{name} - {spec}",
            description=f"{bio}. Specialization: {spec}. Organization: {org}.",
            stage="Active", sector=spec, district=district, is_demo=True, owner_id=owner_id,
            meta={"specialization": spec, "organization": org, "experience_years": random.randint(5, 25),
                   "availability": random.choice(["Full-time", "Part-time", "Weekends"])},
        )
        session.add(e)
    session.commit()


def seed_schemes(session, owner_id, count=15):
    schemes = [
        ("Gujarat Startup Policy 2020 - Interest Subsidy", "Subsidy", "12% interest subsidy for 5 years on term loans up to ₹1 crore", "Ahmedabad"),
        ("Gujarat Startup Policy 2020 - Seed Fund", "Seed Fund", "Up to ₹40 lakhs seed funding for DPIIT-recognized startups", "Gandhinagar"),
        ("Startup India Seed Fund Scheme", "Grant", "Up to ₹20 lakhs for proof of concept, up to ₹50 lakhs for prototype", "Ahmedabad"),
        ("MUDRA Loan Scheme", "Subsidy", "Loans up to ₹10 lakhs without collateral for micro enterprises", "All Gujarat"),
        ("PMEGP - Prime Minister Employment Generation Programme", "Grant", "Subsidy of 25-35% for new enterprise projects up to ₹50 lakhs", "All Gujarat"),
        ("Gujarat Patent Filing Reimbursement", "Patent Reimbursement", "Up to ₹10 lakhs reimbursement for patent filing and prosecution", "Gandhinagar"),
        ("Gujarat Stamp Duty Exemption for Startups", "Tax Benefit", "100% exemption on stamp duty for startup office spaces", "All Gujarat"),
        ("Gujarat GST Reimbursement Scheme", "Tax Benefit", "Reimbursement of state GST paid for first 5 years", "Gandhinagar"),
        ("MSME Credit Guarantee Scheme", "Subsidy", "Credit guarantee up to ₹2 crores for MSME units", "All Gujarat"),
        ("Gujarat Solar Energy Policy - Subsidy", "Subsidy", "40% capital subsidy on solar installations for MSMEs", "All Gujarat"),
        ("Gujarat Textile Package Scheme", "Grant", "Capital subsidy for textile machinery up to ₹50 lakhs", "Surat"),
        ("Gujarat Food Processing Policy", "Grant", "25% capital subsidy for food processing units", "All Gujarat"),
        ("Gujarat Biotechnology Policy", "Grant", "Financial assistance for biotech startups up to ₹25 lakhs", "Ahmedabad"),
        ("Startup India DPIIT Recognition Benefits", "Tax Benefit", "3-year income tax exemption and self-certification for labor laws", "National"),
        ("Gujarat Export Promotion Scheme", "Export Support", "Reimbursement of freight charges for export of Gujarat products", "All Gujarat"),
    ]

    for i, (name, cat, desc, dist) in enumerate(schemes[:count]):
        e = Entity(
            kind=EntityKind.scheme, title=name, description=desc,
            stage="Active", district=dist, is_demo=True, owner_id=owner_id,
            meta={"category": cat, "eligibility": "DPIIT-recognized startups", "max_benefit": f"₹{random.randint(5, 50)} lakhs"},
        )
        session.add(e)
    session.commit()


def seed_incubators(session, owner_id, count=10):
    incubators = [
        ("CITI Incubator", "University", "Gandhinagar", "Gujarat Technological University", 50, "CITI-incubated startups have raised ₹200 Cr+"),
        ("VJTI Incubation Center", "University", "Mumbai", "VJTI Mumbai", 40, "Technology-focused incubator"),
        ("IITGN Incubation Center", "University", "Gandhinagar", "IIT Gandhinagar", 35, "Deep-tech and research-based startups"),
        ("Surat Incubation Hub", "Government", "Surat", "Surat Municipal Corporation", 30, "Supported by Gujarat government"),
        ("Gujarat Startup Hub", "Government", "Gandhinagar", "Gujarat Startup Policy Cell", 60, "State-level startup support"),
        ("Ahmedabad Incubation Center", "Private", "Ahmedabad", "Ahmedabad Management Association", 25, "General business incubation"),
        ("Rajkot Innovation Hub", "Government", "Rajkot", "Rajkot Municipal Corporation", 20, "Saurashtra region support"),
        ("Vadodara Startup Factory", "Private", "Vadodara", "Vadodara Startup Foundation", 22, "Manufacturing and industrial focus"),
        ("Kutch Green Innovation Hub", "Government", "Kachchh", "Kutch District Administration", 15, "Sustainability and green tech"),
        ("Baroda Youth Incubator", "University", "Vadodara", "MS University", 18, "Youth entrepreneurship focus"),
    ]

    for i, (name, itype, district, org, capacity, desc) in enumerate(incubators[:count]):
        e = Entity(
            kind=EntityKind.incubator, title=name,
            description=f"{itype} incubator in {district}. Organization: {org}. {desc}",
            stage="Active", district=district, is_demo=True, owner_id=owner_id,
            meta={"type": itype, "organization": org, "capacity": capacity,
                   "focus_areas": random.sample(GUJARAT_SECTORS, random.randint(2, 5)),
                   "website": f"https://www.{name.lower().replace(' ', '')}.org"},
        )
        session.add(e)
    session.commit()


def seed_notifications(session, users):
    notifs = [
        ("info", "Welcome to Gujarat Innovation Ecosystem!"),
        ("action", "2 funding requests pending review"),
        ("system", "Demo data seeded successfully"),
        ("warning", "ThermaCrop Storage Module milestones overdue"),
        ("info", "CropGuard AI Mobile App stage advanced to Ready for Market"),
        ("action", "New mentor Dr. Priya Desai joined the platform"),
    ]
    for user in users:
        for kind, msg in notifs:
            n = Notification(user_id=user.id, kind=kind, message=msg, read=random.choice([True, False]))
            session.add(n)
    session.commit()


def seed_audit(session, users):
    admin = users[0]
    actions = ["created", "updated", "seeded"]
    entity_types = ["research", "innovation", "ipr", "startup", "system"]
    for i in range(20):
        a = AuditLog(
            action=random.choice(actions),
            entity_type=random.choice(entity_types),
            entity_id=random.randint(1, 100),
            actor_id=admin.id,
            detail={"seed": True, "batch": i},
            created_at=datetime.now() - timedelta(hours=random.randint(1, 72)),
        )
        session.add(a)
    session.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reset', action='store_true')
    args = parser.parse_args()

    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        if args.reset:
            print("Dropping all tables...")
            Base.metadata.drop_all(bind=engine)
            print("Creating tables...")
            Base.metadata.create_all(bind=engine)

        print("Seeding users...")
        users = seed_users(db)
        admin_id = users[0].id
        print(f"  Created {len(users)} users (admin: {users[0].email})")

        print("Seeding research (25)...")
        seed_research(db, admin_id, 25)

        print("Seeding innovations (20)...")
        seed_innovations(db, admin_id, 20)

        print("Seeding IPR (15)...")
        seed_ipr(db, admin_id, 15)

        print("Seeding startups (30)...")
        seed_startups(db, admin_id, 30)

        print("Seeding mentors (15)...")
        seed_mentors(db, admin_id, 15)

        print("Seeding schemes (15)...")
        seed_schemes(db, admin_id, 15)

        print("Seeding incubators (10)...")
        seed_incubators(db, admin_id, 10)

        print("Seeding notifications...")
        seed_notifications(db, users)

        print("Seeding audit logs...")
        seed_audit(db, users)

        total = db.query(Entity).count()
        print(f"\nDone! Total entities: {total}")
        print("Demo accounts:")
        for email, name, role, _, _ in DEMO_USERS:
            print(f"  {role:12s} {email:35s} Demo@123")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == '__main__':
    main()
