from datetime import datetime, timezone

from app.database import SessionLocal, engine, Base
from app.models import User, Record, AuditLog, Notification, TokenBlacklist
from app.dependencies import pwd
from app.utils import audit, notify


def seed():
    Base.metadata.create_all(engine)
    s = SessionLocal()
    try:
        if s.query(User).count():
            return

        admin = User(
            name="Demo Administrator", email="admin@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="admin",
            district="Ahmedabad", organization="UdaanSetu Platform",
        )
        researcher = User(
            name="Aarav Patel", email="researcher@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="researcher",
            district="Ahmedabad", organization="Gujarat Agricultural University",
        )
        researcher2 = User(
            name="Priya Sharma", email="researcher2@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="researcher",
            district="Pune", organization="MIT College of Engineering",
        )
        mentor = User(
            name="Dr. Nisha Shah", email="mentor@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="mentor",
            district="Ahmedabad", organization="IIM Ahmedabad",
        )
        investor = User(
            name="Rajesh Kumar", email="investor@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="investor",
            district="Mumbai", organization="SeedFund Ventures",
        )
        incubator_user = User(
            name="Sunita Reddy", email="incubator@udaansetu.demo",
            password_hash=pwd.hash("Demo@123"), role="incubator",
            district="Hyderabad", organization="T-Hub Incubator",
        )
        s.add_all([admin, researcher, researcher2, mentor, investor, incubator_user])
        s.flush()

        r1 = Record(kind="research", title="Solar Cold Storage for Small Farms",
            description="DEMO DATA: Affordable thermal storage and IoT monitoring for post-harvest loss reduction.",
            stage="Prototype", district="Ahmedabad", sector="AgriTech", owner_id=researcher.id,
            meta={"progress": 62, "institution": "Gujarat Agricultural University", "funding_required": 750000}, is_demo=True)
        r2 = Record(kind="research", title="Water Purification Using Biochar Filters",
            description="DEMO DATA: Low-cost biochar-based water filtration for arsenic-affected districts.",
            stage="Lab Testing", district="Patna", sector="CleanTech", owner_id=researcher2.id,
            meta={"progress": 38, "institution": "MIT College of Engineering", "funding_required": 500000}, is_demo=True)
        r3 = Record(kind="research", title="AI-Powered Crop Disease Detection",
            description="DEMO DATA: Mobile app using edge AI for real-time plant disease identification.",
            stage="Field Trial", district="Jaipur", sector="AgriTech", owner_id=researcher.id,
            meta={"progress": 75, "institution": "Rajasthan Agricultural University", "funding_required": 400000}, is_demo=True)
        r4 = Record(kind="research", title="Biodegradable Packaging from Agricultural Waste",
            description="DEMO DATA: Converting rice straw and sugarcane bagasse into compostable packaging.",
            stage="Validation", district="Ludhiana", sector="Materials", owner_id=researcher2.id,
            meta={"progress": 55, "institution": "PAU Ludhiana", "funding_required": 600000}, is_demo=True)
        s.add_all([r1, r2, r3, r4]); s.flush()

        m1 = Record(kind="milestone", title="Field pilot validation", description="DEMO DATA",
            stage="In Progress", parent_id=r1.id, meta={"due_date": "2026-08-01", "progress": 40}, is_demo=True)
        m2 = Record(kind="milestone", title="Prototype thermal efficiency report", description="DEMO DATA",
            stage="Done", parent_id=r1.id, meta={"due_date": "2026-06-15", "progress": 100}, is_demo=True)
        m3 = Record(kind="milestone", title="Regulatory submission", description="DEMO DATA",
            stage="Pending", parent_id=r1.id, meta={"due_date": "2026-09-30", "progress": 0}, is_demo=True)
        m4 = Record(kind="milestone", title="Biochar filter prototyping", description="DEMO DATA",
            stage="In Progress", parent_id=r2.id, meta={"due_date": "2026-07-20", "progress": 55}, is_demo=True)
        m5 = Record(kind="milestone", title="Mobile app beta release", description="DEMO DATA",
            stage="Done", parent_id=r3.id, meta={"due_date": "2026-05-30", "progress": 100}, is_demo=True)
        m6 = Record(kind="milestone", title="Packaging material stress testing", description="DEMO DATA",
            stage="In Progress", parent_id=r4.id, meta={"due_date": "2026-08-15", "progress": 30}, is_demo=True)
        s.add_all([m1, m2, m3, m4, m5, m6]); s.flush()

        i1 = Record(kind="innovation", title="ThermaCrop Storage Module",
            description="DEMO DATA: Phase-change thermal battery for farm cold storage.",
            stage="IPR Screening", district="Ahmedabad", sector="AgriTech",
            owner_id=researcher.id, parent_id=r1.id, meta={"readiness_level": "TRL 5"}, is_demo=True)
        i2 = Record(kind="innovation", title="BioChar+ Water Filter Cartridge",
            description="DEMO DATA: Modular biochar filter with replaceable cartridges.",
            stage="Concept", district="Patna", sector="CleanTech",
            owner_id=researcher2.id, parent_id=r2.id, meta={"readiness_level": "TRL 3"}, is_demo=True)
        i3 = Record(kind="innovation", title="CropGuard AI Mobile App",
            description="DEMO DATA: Edge-AI mobile application for crop disease detection.",
            stage="Ready for Market", district="Jaipur", sector="AgriTech",
            owner_id=researcher.id, parent_id=r3.id, meta={"readiness_level": "TRL 7"}, is_demo=True)
        i4 = Record(kind="innovation", title="GreenPack Compostable Material",
            description="DEMO DATA: Agricultural waste-based biodegradable packaging.",
            stage="Prototype", district="Ludhiana", sector="Materials",
            owner_id=researcher2.id, parent_id=r4.id, meta={"readiness_level": "TRL 4"}, is_demo=True)
        s.add_all([i1, i2, i3, i4]); s.flush()

        ipr1 = Record(kind="ipr", title="ThermaCrop provisional patent", description="DEMO DATA",
            stage="Filed", parent_id=i1.id, sector="AgriTech", district="Ahmedabad",
            meta={"filing_date": "2026-03-15", "application_no": "IN/2026/41234"}, is_demo=True)
        ipr2 = Record(kind="ipr", title="CropGuard AI algorithm patent", description="DEMO DATA",
            stage="Examination", parent_id=i3.id, sector="AgriTech", district="Jaipur",
            meta={"filing_date": "2025-11-20", "application_no": "IN/2025/98765"}, is_demo=True)
        ipr3 = Record(kind="ipr", title="GreenPack material composition", description="DEMO DATA",
            stage="Screening", parent_id=i4.id, sector="Materials", district="Ludhiana",
            meta={"filing_date": "2026-06-01", "application_no": "IN/2026/55678"}, is_demo=True)
        s.add_all([ipr1, ipr2, ipr3]); s.flush()

        st1 = Record(kind="startup", title="ThermaCrop Labs", description="DEMO DATA",
            stage="Pre-seed", parent_id=i1.id, sector="AgriTech", district="Ahmedabad",
            meta={"jobs_created": 4, "farmers_reached": 80, "revenue": 0,
                  "impact_description": "Reduced post-harvest losses by 30% in pilot farms"}, is_demo=True)
        st2 = Record(kind="startup", title="CropGuard Technologies", description="DEMO DATA",
            stage="Seed", parent_id=i3.id, sector="AgriTech", district="Jaipur",
            meta={"jobs_created": 12, "farmers_reached": 340, "revenue": 850000,
                  "impact_description": "340 farmers using the app"}, is_demo=True)
        st3 = Record(kind="startup", title="GreenPack Solutions", description="DEMO DATA",
            stage="Idea", parent_id=i4.id, sector="Materials", district="Ludhiana",
            meta={"jobs_created": 2, "farmers_reached": 0, "revenue": 120000,
                  "impact_description": "Pilot production line"}, is_demo=True)
        s.add_all([st1, st2, st3]); s.flush()

        mnt1 = Record(kind="mentor", title="Dr. Nisha Shah", description="DEMO DATA",
            stage="Available", sector="AgriTech", district="Ahmedabad",
            meta={"expertise": ["IPR", "cold chain", "product development"],
                  "bio": "Former CSIR scientist."}, is_demo=True)
        mnt2 = Record(kind="mentor", title="Prof. Vikram Menon", description="DEMO DATA",
            stage="Available", sector="CleanTech", district="Pune",
            meta={"expertise": ["water purification", "biomaterials"],
                  "bio": "IIT Bombay professor."}, is_demo=True)
        mnt3 = Record(kind="mentor", title="Ananya Gupta", description="DEMO DATA",
            stage="Available", sector="AgriTech", district="Mumbai",
            meta={"expertise": ["go-to-market", "rural distribution"],
                  "bio": "Serial entrepreneur."}, is_demo=True)
        mnt4 = Record(kind="mentor", title="Karthik Iyer", description="DEMO DATA",
            stage="Available", sector="IPR", district="Bangalore",
            meta={"expertise": ["patent drafting", "IPR strategy"],
                  "bio": "Top IP law firm veteran."}, is_demo=True)
        s.add_all([mnt1, mnt2, mnt3, mnt4]); s.flush()

        fs1 = Record(kind="scheme", title="Prototype Support Grant", description="DEMO DATA",
            stage="Open", sector="AgriTech", district="Gandhinagar",
            meta={"amount": 500000, "eligibility": "prototype stage", "deadline": "2026-12-31", "type": "Grant"}, is_demo=True)
        fs2 = Record(kind="scheme", title="Rural Innovation Impact Fund", description="DEMO DATA",
            stage="Open", sector="General", district="New Delhi",
            meta={"amount": 2000000, "eligibility": "rural impact", "deadline": "2026-10-15", "type": "Equity-free Grant"}, is_demo=True)
        fs3 = Record(kind="scheme", title="CleanTech Accelerator Program", description="DEMO DATA",
            stage="Open", sector="CleanTech", district="Pune",
            meta={"amount": 1000000, "eligibility": "cleantech early-stage", "deadline": "2026-09-01", "type": "Accelerator"}, is_demo=True)
        fs4 = Record(kind="scheme", title="Deep-Tech Patent Filing Support", description="DEMO DATA",
            stage="Open", sector="General", district="Bangalore",
            meta={"amount": 200000, "eligibility": "deep-tech", "deadline": "2026-11-30", "type": "Grant"}, is_demo=True)
        s.add_all([fs1, fs2, fs3, fs4]); s.flush()

        inc1 = Record(kind="incubator", title="Demo Innovation Hub", description="DEMO DATA",
            stage="Open", sector="ClimateTech", district="Ahmedabad",
            meta={"capacity": 20, "services": ["lab access", "mentorship"]}, is_demo=True)
        inc2 = Record(kind="incubator", title="T-Hub Innovation Campus", description="DEMO DATA",
            stage="Open", sector="General", district="Hyderabad",
            meta={"capacity": 50, "services": ["prototyping", "investor network"]}, is_demo=True)
        inc3 = Record(kind="incubator", title="GreenVentures Climate Lab", description="DEMO DATA",
            stage="Open", sector="ClimateTech", district="Pune",
            meta={"capacity": 15, "services": ["sustainability lab"]}, is_demo=True)
        s.add_all([inc1, inc2, inc3]); s.flush()

        fr1 = Record(kind="funding_request", title="ThermaCrop Series Pre-Seed", description="DEMO DATA",
            stage="Submitted", sector="AgriTech", district="Ahmedabad", parent_id=st1.id,
            meta={"amount": 750000, "scheme_id": fs1.id, "startup_id": st1.id}, is_demo=True)
        fr2 = Record(kind="funding_request", title="CropGuard Seed Round", description="DEMO DATA",
            stage="Under Review", sector="AgriTech", district="Jaipur", parent_id=st2.id,
            meta={"amount": 2000000, "scheme_id": fs2.id, "startup_id": st2.id}, is_demo=True)
        s.add_all([fr1, fr2]); s.flush()

        for uid in [researcher.id, researcher2.id]:
            notify(s, uid, "Welcome to UdaanSetu!", "info")
        notify(s, admin.id, "System seeded with demo data.", "system")
        notify(s, investor.id, "2 funding requests pending review.", "action")

        for r in [r1, r2, i1, i3, st1, st2]:
            audit(s, admin, "seeded", r)

        s.commit()
    finally:
        s.close()
