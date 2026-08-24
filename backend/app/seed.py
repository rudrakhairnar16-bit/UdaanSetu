from datetime import datetime
import json
import os

from app.database import SessionLocal, engine, Base
from app.models import (
    User, Record, AuditLog, Notification, TokenBlacklist, Department, Challenge,
    Pilot, PilotMilestone, Payment, Evaluation, ScaleUpDecision, Template,
    Application, EligibilityCheck, ChallengeRequirement, EvaluationScore,
    ConflictOfInterest, PilotMetric, PilotEvidence, Validation, Procurement,
    Contract, PurchaseOrder, Grievance, IPDataAgreement, DocumentVersion,
    ChallengeVersion, ComplianceChecklist, PilotIncident,
)
from app.dependencies import pwd
from app.utils import audit, audit_entity, notify


# ── JSON loader ──

def _load_json(filename):
    base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    path = os.path.join(base, "data", filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ── Timeline helpers ──

def _dt(year, month, day, hour=10, minute=0):
    return datetime(year, month, day, hour, minute)


# ── Main seed ──

def seed():
    Base.metadata.create_all(engine)
    s = SessionLocal()
    try:
        if s.query(User).count():
            return

        # ════════════════════════════════════════════════════════════════
        # 1. USERS — keep existing 11 + load 20 mentors from JSON
        # ════════════════════════════════════════════════════════════════
        admin = User(
            name="System Administrator", email="admin@udaansetu.gov.in",
            password_hash=pwd.hash("Admin@123"), role="admin",
            district="Mumbai", organization="UdaanSetu Platform",
        )
        researcher = User(
            name="Dr. Smita Kulkarni", email="smita.kulkarni@puneuni.ac.in",
            password_hash=pwd.hash("Research@123"), role="researcher",
            district="Pune", organization="Savitribai Phule Pune University",
        )
        researcher2 = User(
            name="Prof. Anil Deshmukh", email="anil.deshmukh@vjti.ac.in",
            password_hash=pwd.hash("Research@123"), role="researcher",
            district="Mumbai", organization="Veermata Jijabai Technological Institute",
        )
        mentor = User(
            name="Kiran Deshpande", email="kiran.deshpande@tiemumbai.org",
            password_hash=pwd.hash("Mentor@123"), role="mentor",
            district="Mumbai", organization="T-Hub Mumbai",
        )
        investor = User(
            name="Ankit Mehta", email="ankit.mehta@blumevc.com",
            password_hash=pwd.hash("Invest@123"), role="investor",
            district="Mumbai", organization="Blume Ventures",
        )
        incubator_user = User(
            name="Prashant Pitti", email="prashant@ietech.in",
            password_hash=pwd.hash("Incub@123"), role="incubator",
            district="Pune", organization="Centre for Innovation, Incubation & Entrepreneurship (IITB-CIIE)",
        )
        govt_officer = User(
            name="Dr. Rajesh Patil", email="rajesh.patil@maharashtra.gov.in",
            password_hash=pwd.hash("Govt@123"), role="govt_officer",
            district="Mumbai", organization="Dept of Skills, Employment, Entrepreneurship & Innovation, Govt of Maharashtra",
        )
        procurement_officer = User(
            name="Meera Sharma", email="meera.sharma@maharashtra.gov.in",
            password_hash=pwd.hash("Procure@123"), role="procurement_officer",
            district="Mumbai", organization="Directorate of Supplies & Disposals, Govt of Maharashtra",
        )
        evaluator = User(
            name="Dr. Vikram Patil", email="vikram.patil@ieee.org",
            password_hash=pwd.hash("Eval@123"), role="evaluator",
            district="Pune", organization="IEEE Senior Member, Pune Chapter",
        )
        validator = User(
            name="Anjali Kulkarni", email="anjali.kulkarni@ncssc.in",
            password_hash=pwd.hash("Valid@123"), role="validator",
            district="Nagpur", organization="National Centre for Social Security Systems, Nagpur",
        )
        auditor = User(
            name="Suresh Jogani", email="suresh.jogani@cag.gov.in",
            password_hash=pwd.hash("Audit@123"), role="auditor",
            district="Mumbai", organization="Comptroller and Auditor General of India, Mumbai Regional Office",
        )
        s.add_all([admin, researcher, researcher2, mentor, investor, incubator_user,
                    govt_officer, procurement_officer, evaluator, validator, auditor])
        s.flush()

        # ── Load 20 mentors from JSON ──
        mentors_json = _load_json("maharashtra_mentors.json")
        mentor_users = []
        for m_data in mentors_json["mentors"][:20]:
            name = m_data["name"]
            email_slug = name.lower().replace(" ", ".").replace("'", "").replace("..", ".").strip(".")
            email = f"{email_slug}@udaansetu.gov.in"
            u = User(
                name=name, email=email,
                password_hash=pwd.hash("Mentor@123"), role="mentor",
                district=m_data.get("district", "Pune"),
                organization=m_data.get("organization", m_data.get("institution", "")),
            )
            mentor_users.append(u)
        s.add_all(mentor_users)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 2. DEPARTMENTS — keep existing 7
        # ════════════════════════════════════════════════════════════════
        dept_dse = Department(
            name="Department of Skills, Employment, Entrepreneurship & Innovation",
            sector="Government", district="Mumbai",
            contact_email="dse.mh@gov.in", contact_phone="022-22027000",
            website="https://dese.maharashtra.gov.in", address="5th Floor, Mantralaya, Mumbai 400032",
            meta={"focus": "Skill development, startup promotion, innovation ecosystem",
                  "minister": "Minister of Skill Development & Entrepreneurship",
                  "jurisdiction": "State-level"},
        )
        dept_dit = Department(
            name="Department of Information Technology", sector="IT", district="Pune",
            contact_email="dit.mh@gov.in", contact_phone="020-25501000",
            website="https://it.maharashtra.gov.in", address="4th Floor, New Administrative Building, Pune 411001",
            meta={"focus": "Digital governance, IT infrastructure, smart cities, data centers",
                  "programs": ["Maharashtra IT Policy 2020", "Digital Maharashtra"]},
        )
        dept_da = Department(
            name="Department of Agriculture", sector="Agriculture", district="Pune",
            contact_email="agripd.mh@gov.in", contact_phone="020-25532765",
            website="https://krishi.maharashtra.gov.in", address="3rd Floor, Agri Vikas, Pune 411001",
            meta={"focus": "Agriculture modernization, farmer welfare, agritech adoption",
                  "key_schemes": ["Krishi Mahotsav", "Jalyukt Shivar Abhiyan", "Namo Shetkari MahaSanman"],
                  "farmer_count": "1.4 crore farmers in Maharashtra"},
        )
        dept_dh = Department(
            name="Department of Public Health", sector="Health", district="Mumbai",
            contact_email="phd.mh@gov.in", contact_phone="022-22025864",
            website="https://phd.maharashtra.gov.in", address="3rd Floor, Bhausaheb Hirey Marg, Mumbai 400001",
            meta={"focus": "Public health, digital health, medical devices, rural healthcare",
                  "infrastructure": "1813 rural hospitals, 4600+ PHCs across Maharashtra"},
        )
        dept_du = Department(
            name="Department of Urban Development", sector="Infrastructure", district="Mumbai",
            contact_email="urbdev.mh@gov.in", contact_phone="022-22046900",
            website="https://mohua.maharashtra.gov.in", address="Hutatma Rajguru Marg, Mumbai 400001",
            meta={"focus": "Urban planning, Smart Cities Mission, public transport, AMRUT",
                  "smart_cities": ["Pune", "Nagpur", "Thane", "Nashik"]},
        )
        dept_de = Department(
            name="Department of Environment", sector="Environment", district="Mumbai",
            contact_email="env.mh@gov.in", contact_phone="022-22042320",
            website="https://envforest.maharashtra.gov.in", address="3rd Floor, Mantralaya, Mumbai 400032",
            meta={"focus": "Environmental protection, pollution control, clean energy, waste management",
                  "programs": ["EV Policy Maharashtra 2021", "Plastic Ban", "Solar Policy"]},
        )
        dept_dwd = Department(
            name="Department of Water Resources", sector="Water", district="Nagpur",
            contact_email="water.mh@gov.in", contact_phone="0712-2560844",
            website="https://waterresources.maharashtra.gov.in", address="Satpuda House, Nagpur 440001",
            meta={"focus": "Irrigation, water supply, river linking, watershed development",
                  "key_projects": ["Godavari Marathwada Irrigation", "Krishna Valley Development"]},
        )
        s.add_all([dept_dse, dept_dit, dept_da, dept_dh, dept_du, dept_de, dept_dwd])
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 3. CHALLENGES — keep existing 7
        # ════════════════════════════════════════════════════════════════
        ch1 = Challenge(
            title="AI-Powered Crop Advisory for Smallholder Farmers in Maharashtra",
            description=(
                "Maharashtra has 1.4 crore farmers, majority being small and marginal (<2 hectares). "
                "Current extension services are inadequate. Develop an AI-based mobile advisory system "
                "delivering hyper-local crop recommendations, weather-based alerts, pest/disease management "
                "guidance, and market price information in Marathi and Hindi."
            ),
            category="agriculture", department_id=dept_da.id, status="open",
            budget_range="50L-1Cr", timeline_weeks=16, district="Pune",
            sector="AgriTech", owner_id=govt_officer.id,
            meta={"priority": "high",
                  "target_districts": ["Pune", "Nashik", "Ahmednagar", "Solapur", "Satara"],
                  "existing_platform": "MahaAgriTech Portal",
                  "user_base": "1.4 crore farmers",
                  "compliance": "Data localization mandatory, farmer consent required"},
        )
        ch2 = Challenge(
            title="Smart Water Metering for Municipal Corporations",
            description=(
                "Maharashtra's major cities face 25-40% Non-Revenue Water (NRW) losses. Mumbai alone "
                "loses 260 MLD of treated water daily. Design and deploy IoT-based smart water metering "
                "solutions for municipal corporations to monitor real-time water consumption, detect leaks."
            ),
            category="infrastructure", department_id=dept_du.id, status="open",
            budget_range="1Cr-3Cr", timeline_weeks=24, district="Mumbai",
            sector="IoT", owner_id=govt_officer.id,
            meta={"priority": "high",
                  "target_districts": ["Mumbai", "Pune", "Thane", "Nashik", "Nagpur"],
                  "nrb_target": "Reduce NRW from 30% to 15%",
                  "pilot_corporation": "Pune Municipal Corporation"},
        )
        ch3 = Challenge(
            title="Digital Health Records for Rural Primary Health Centres",
            description=(
                "Maharashtra has 4600+ PHCs across rural areas. Currently using paper registers. "
                "Build a lightweight, offline-first digital health records platform for PHCs with "
                "interoperability with Ayushman Bharat Digital Mission (ABDM)."
            ),
            category="health", department_id=dept_dh.id, status="open",
            budget_range="25L-75L", timeline_weeks=20, district="Nagpur",
            sector="HealthTech", owner_id=govt_officer.id,
            meta={"priority": "high",
                  "target_districts": ["Nagpur", "Amravati", "Yavatmal", "Gadchiroli", "Nandurbar"],
                  "phc_count": 4600, "abdm_compliance": "Mandatory"},
        )
        ch4 = Challenge(
            title="Skill Gap Analysis & Training Pathway Engine for Maharashtra Youth",
            description=(
                "Develop an ML-based engine to analyze skill gaps in Maharashtra youth by district "
                "and recommend personalized training pathways aligned with MahaSkillNet and industry demand."
            ),
            category="digital", department_id=dept_dse.id, status="draft",
            budget_range="15L-40L", timeline_weeks=12, district="Mumbai",
            sector="EdTech", owner_id=govt_officer.id,
            meta={"priority": "medium",
                  "target_districts": ["Mumbai", "Pune", "Nashik", "Aurangabad", "Nagpur"],
                  "youth_population": "2.5 crore"},
        )
        ch5 = Challenge(
            title="Traffic Flow Optimization for Pune Smart City",
            description=(
                "Deploy edge computing nodes at 50 major traffic junctions to optimize signal timing "
                "using real-time computer vision analytics, reduce congestion."
            ),
            category="digital", department_id=dept_dit.id, status="evaluating",
            budget_range="50L-1.5Cr", timeline_weeks=20, district="Pune",
            sector="SmartCity", owner_id=govt_officer.id,
            meta={"priority": "medium", "target_districts": ["Pune"], "junctions": 50},
        )
        ch6 = Challenge(
            title="River Water Quality Monitoring Network for Godavari Basin",
            description=(
                "Deploy continuous IoT-based water quality monitoring sensors across 200 stations along "
                "the Godavari basin with real-time data analytics and automated alerting."
            ),
            category="environment", department_id=dept_dwd.id, status="open",
            budget_range="75L-2Cr", timeline_weeks=28, district="Nagpur",
            sector="CleanTech", owner_id=govt_officer.id,
            meta={"priority": "high",
                  "target_districts": ["Nagpur", "Nanded", "Washim", "Yavatmal"],
                  "monitoring_stations": 200},
        )
        ch7 = Challenge(
            title="Electric Vehicle Charging Infrastructure for Maharashtra State Highways",
            description=(
                "Design a scalable, solar-powered EV charging solution for 100 stations "
                "along 10 major state highways. Must support fast charging (CCS2) and battery swapping."
            ),
            category="environment", department_id=dept_de.id, status="open",
            budget_range="2Cr-5Cr", timeline_weeks=32, district="Mumbai",
            sector="CleanTech", owner_id=govt_officer.id,
            meta={"priority": "high",
                  "target_highways": ["Mumbai-Pune", "Pune-Nashik", "Mumbai-Nagpur", "Mumbai-Goa"],
                  "current_chargers": 400, "target_chargers": 100},
        )
        s.add_all([ch1, ch2, ch3, ch4, ch5, ch6, ch7])
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 4. SCHEMES — 15 from JSON (Jan 2026)
        # ════════════════════════════════════════════════════════════════
        schemes_json = _load_json("maharashtra_schemes.json")
        scheme_records = []
        for sc in schemes_json["schemes"][:15]:
            r = Record(
                kind="scheme", title=sc.get("title", sc.get("name", "")),
                description=sc.get("description", ""),
                stage="Active", district=sc.get("district", "Mumbai"),
                sector=sc.get("sector", sc.get("type", "Government")),
                owner_id=govt_officer.id,
                meta=sc,
                created_at=_dt(2026, 1, 10),
                updated_at=_dt(2026, 1, 10),
            )
            scheme_records.append(r)
        s.add_all(scheme_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 5. INCUBATORS — 12 from JSON (Jan 2026)
        # ════════════════════════════════════════════════════════════════
        incubators_json = _load_json("maharashtra_incubators.json")
        incubator_records = []
        for ic in incubators_json["incubators"][:12]:
            r = Record(
                kind="incubator", title=ic["name"],
                description=ic.get("description", ""),
                stage="Operational", district=ic.get("district", "Pune"),
                sector=ic.get("sector", "Technology"),
                owner_id=incubator_user.id,
                meta=ic,
                created_at=_dt(2026, 1, 15),
                updated_at=_dt(2026, 1, 15),
            )
            incubator_records.append(r)
        s.add_all(incubator_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 6. STARTUPS — 50 from JSON (Feb 2026) + keep existing 3
        # ════════════════════════════════════════════════════════════════
        startup1 = Record(
            kind="startup", title="CropSafe AI",
            description="AI-powered crop advisory and disease detection platform serving 50,000+ farmers in Maharashtra.",
            stage="Seed", district="Pune", sector="AgriTech",
            owner_id=researcher.id,
            meta={"founder": "Rohan Kshirsagar", "founded": 2024,
                  "funding_raised": 8000000, "jobs_created": 15,
                  "farmers_served": 50000, "revenue": 3500000,
                  "impact": "22% average yield improvement in pilot districts",
                  "dpiit_registered": True},
            created_at=_dt(2026, 2, 1), updated_at=_dt(2026, 2, 1),
        )
        startup2 = Record(
            kind="startup", title="WaterLens Technologies",
            description="IoT-based smart water management and leak detection for municipal water systems.",
            stage="Series A", district="Mumbai", sector="IoT",
            owner_id=researcher2.id,
            meta={"founder": "Neha Joshi", "founded": 2023,
                  "funding_raised": 45000000, "jobs_created": 45,
                  "cities_deployed": 3, "nrb_reduction": "30%",
                  "revenue": 12000000,
                  "impact": "340 MLD water saved annually",
                  "dpiit_registered": True},
            created_at=_dt(2026, 2, 1), updated_at=_dt(2026, 2, 1),
        )
        startup3 = Record(
            kind="startup", title="MediConnect Rural",
            description="Telemedicine and digital health records platform for rural Maharashtra.",
            stage="Pre-Seed", district="Nagpur", sector="HealthTech",
            owner_id=researcher.id,
            meta={"founder": "Dr. Priya Borkar", "founded": 2025,
                  "funding_raised": 2500000, "jobs_created": 8,
                  "kiosks": 200, "patients_served": 35000,
                  "revenue": 800000,
                  "impact": "Reduced average travel time for rural patients by 3 hours",
                  "dpiit_registered": True},
            created_at=_dt(2026, 2, 1), updated_at=_dt(2026, 2, 1),
        )
        s.add_all([startup1, startup2, startup3])
        s.flush()

        startups_json = _load_json("maharashtra_startups.json")
        startup_records = []
        for st in startups_json["startups"][:50]:
            r = Record(
                kind="startup", title=st["name"],
                description=st.get("description", ""),
                stage=st.get("stage", "Seed"),
                district=st.get("district", "Pune"),
                sector=st.get("sector", "Technology"),
                owner_id=researcher.id,
                meta=st,
                created_at=_dt(2026, 2, 5),
                updated_at=_dt(2026, 2, 5),
            )
            startup_records.append(r)
        s.add_all(startup_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 7. RESEARCH PROJECTS — 20 from JSON (Feb 2026) + keep existing 2
        # ════════════════════════════════════════════════════════════════
        r1 = Record(
            kind="research", title="Satellite-Based Crop Health Monitoring for Vidarbha",
            description="Using Sentinel-2 satellite data combined with ground-truth IoT sensors for early detection of crop stress.",
            stage="Field Trial", district="Amravati", sector="AgriTech",
            owner_id=researcher.id,
            meta={"progress": 68, "institution": "Savitribai Phule Pune University", "funding_required": 500000},
            created_at=_dt(2026, 2, 1), updated_at=_dt(2026, 2, 1),
        )
        r2 = Record(
            kind="research", title="Low-Cost Water Purification Using Ceramic Membranes",
            description="Indigenous ceramic membrane technology for arsenic and fluoride removal from groundwater.",
            stage="Lab Testing", district="Nanded", sector="CleanTech",
            owner_id=researcher2.id,
            meta={"progress": 45, "institution": "VJTI Mumbai", "funding_required": 350000},
            created_at=_dt(2026, 2, 1), updated_at=_dt(2026, 2, 1),
        )
        s.add_all([r1, r2])
        s.flush()

        research_json = _load_json("maharashtra_research.json")
        research_records = []
        for rp in research_json["research_projects"][:20]:
            r = Record(
                kind="research", title=rp["title"],
                description=rp.get("description", ""),
                stage=rp.get("stage", "Proposed"),
                district=rp.get("district", "Pune"),
                sector=rp.get("sector", "Research"),
                owner_id=researcher.id,
                meta=rp,
                created_at=_dt(2026, 2, 10),
                updated_at=_dt(2026, 2, 10),
            )
            research_records.append(r)
        s.add_all(research_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 8. INNOVATIONS — 15 from JSON (Feb 2026)
        # ════════════════════════════════════════════════════════════════
        innovations_json = _load_json("maharashtra_innovations.json")
        innovation_records = []
        for inv in innovations_json["innovations"][:15]:
            r = Record(
                kind="innovation", title=inv.get("title", inv.get("name", "")),
                description=inv.get("description", ""),
                stage=inv.get("stage", "Prototype"),
                district=inv.get("district", "Pune"),
                sector=inv.get("sector", "Technology"),
                owner_id=researcher.id,
                meta=inv,
                created_at=_dt(2026, 2, 15),
                updated_at=_dt(2026, 2, 15),
            )
            innovation_records.append(r)
        s.add_all(innovation_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 9. PATENTS — 12 from JSON (Feb 2026)
        # ════════════════════════════════════════════════════════════════
        patents_json = _load_json("maharashtra_patents.json")
        patent_records = []
        for pt in patents_json["patents"][:12]:
            r = Record(
                kind="patent", title=pt["title"],
                description=pt.get("description", ""),
                stage=pt.get("status", "Filed"),
                district=pt.get("district", "Pune"),
                sector=pt.get("sector", "Technology"),
                owner_id=researcher.id,
                meta=pt,
                created_at=_dt(2026, 2, 20),
                updated_at=_dt(2026, 2, 20),
            )
            patent_records.append(r)
        s.add_all(patent_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 10. DISTRICTS — 36 from JSON (Jan 2026)
        # ════════════════════════════════════════════════════════════════
        districts_json = _load_json("maharashtra_districts.json")
        district_records = []
        for d in districts_json["districts"][:36]:
            r = Record(
                kind="district", title=d["name"],
                description=d.get("description", ""),
                stage="Active", district=d["name"],
                sector="Administration",
                owner_id=govt_officer.id,
                meta=d,
                created_at=_dt(2026, 1, 5),
                updated_at=_dt(2026, 1, 5),
            )
            district_records.append(r)
        s.add_all(district_records)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 11. APPLICATIONS — 25 (Mar 2026)
        # ════════════════════════════════════════════════════════════════
        app1 = Application(
            challenge_id=ch1.id, startup_id=startup1.id,
            status="under_review",
            proposal="CropSafe AI proposes to deploy its AI-powered crop advisory platform for 500 smallholder farmers in Pune district with Marathi voice interface.",
            proposed_budget="70L", proposed_timeline_weeks=16,
            meta={"founder": "Rohan Kshirsagar", "team_size": 15,
                  "previous_govt_contracts": 0, "dpiit_registered": True},
            created_at=_dt(2026, 3, 5), updated_at=_dt(2026, 3, 5),
        )
        app2 = Application(
            challenge_id=ch2.id, startup_id=startup2.id,
            status="submitted",
            proposal="WaterLens Technologies proposes IoT-based smart water metering solution for Pune Municipal Corporation with SCADA integration.",
            proposed_budget="2.5Cr", proposed_timeline_weeks=24,
            meta={"founder": "Neha Joshi", "team_size": 45,
                  "previous_govt_contracts": 2, "dpiit_registered": True},
            created_at=_dt(2026, 3, 5), updated_at=_dt(2026, 3, 5),
        )
        app3 = Application(
            challenge_id=ch3.id, startup_id=startup3.id,
            status="eligible",
            proposal="MediConnect Rural proposes offline-first digital health records platform for 20 PHCs in Nagpur division with ABDM integration.",
            proposed_budget="60L", proposed_timeline_weeks=20,
            meta={"founder": "Dr. Priya Borkar", "team_size": 8,
                  "previous_govt_contracts": 0, "dpiit_registered": True},
            created_at=_dt(2026, 3, 5), updated_at=_dt(2026, 3, 5),
        )
        s.add_all([app1, app2, app3])
        s.flush()

        # 22 more applications from startups
        challenges = [ch1, ch2, ch3, ch4, ch5, ch6, ch7]
        all_startups = [startup1, startup2, startup3] + startup_records
        app_statuses = ["submitted", "under_review", "eligible", "shortlisted", "rejected"]
        extra_apps = []
        for i, st in enumerate(all_startups[3:25]):
            ch = challenges[i % len(challenges)]
            a = Application(
                challenge_id=ch.id, startup_id=st.id,
                status=app_statuses[i % len(app_statuses)],
                proposal=f"{st.title} proposes a solution for {ch.title}.",
                proposed_budget=f"{(i + 1) * 10}L",
                proposed_timeline_weeks=12 + (i % 3) * 4,
                meta={"founder": st.meta.get("founder", "Unknown"),
                      "team_size": 5 + i, "dpiit_registered": True},
                created_at=_dt(2026, 3, 10 + i),
                updated_at=_dt(2026, 3, 10 + i),
            )
            extra_apps.append(a)
        s.add_all(extra_apps)
        s.flush()

        all_apps = [app1, app2, app3] + extra_apps

        # ════════════════════════════════════════════════════════════════
        # 12. ELIGIBILITY CHECKS
        # ════════════════════════════════════════════════════════════════
        ec1 = EligibilityCheck(
            application_id=app1.id,
            rules_checked={"dpiit_registered": True, "district_match": True},
            result="eligible", failed_conditions={}, override_reason="",
            meta={"checked_by": govt_officer.id},
            created_at=_dt(2026, 3, 7), updated_at=_dt(2026, 3, 7),
        )
        ec2 = EligibilityCheck(
            application_id=app2.id,
            rules_checked={"dpiit_registered": True, "district_match": True},
            result="eligible", failed_conditions={}, override_reason="",
            meta={"checked_by": govt_officer.id},
            created_at=_dt(2026, 3, 7), updated_at=_dt(2026, 3, 7),
        )
        ec3 = EligibilityCheck(
            application_id=app3.id,
            rules_checked={"dpiit_registered": True, "district_match": True},
            result="eligible", failed_conditions={}, override_reason="",
            meta={"checked_by": govt_officer.id},
            created_at=_dt(2026, 3, 7), updated_at=_dt(2026, 3, 7),
        )
        s.add_all([ec1, ec2, ec3])
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 13. CHALLENGE REQUIREMENTS
        # ════════════════════════════════════════════════════════════════
        reqs_ch1 = [
            ChallengeRequirement(challenge_id=ch1.id, req_type="eligibility", key="dpiit_registered", value="True", is_mandatory=True, created_at=_dt(2026, 1, 20)),
            ChallengeRequirement(challenge_id=ch1.id, req_type="eligibility", key="district_experience", value="Pune/Nashik", is_mandatory=True, created_at=_dt(2026, 1, 20)),
            ChallengeRequirement(challenge_id=ch1.id, req_type="technical", key="marathi_support", value="Must support Marathi UI and voice", is_mandatory=True, created_at=_dt(2026, 1, 20)),
            ChallengeRequirement(challenge_id=ch1.id, req_type="technical", key="offline_capability", value="Must work offline for 48 hours", is_mandatory=True, created_at=_dt(2026, 1, 20)),
            ChallengeRequirement(challenge_id=ch1.id, req_type="security", key="data_localization", value="India-only servers", is_mandatory=True, created_at=_dt(2026, 1, 20)),
            ChallengeRequirement(challenge_id=ch1.id, req_type="financial", key="budget_within_range", value="50L-1Cr", is_mandatory=True, created_at=_dt(2026, 1, 20)),
        ]
        reqs_ch2 = [
            ChallengeRequirement(challenge_id=ch2.id, req_type="eligibility", key="dpiit_registered", value="True", is_mandatory=True, created_at=_dt(2026, 1, 22)),
            ChallengeRequirement(challenge_id=ch2.id, req_type="technical", key="scada_integration", value="Must integrate with existing SCADA", is_mandatory=True, created_at=_dt(2026, 1, 22)),
            ChallengeRequirement(challenge_id=ch2.id, req_type="technical", key="iot_protocols", value="Must support LoRaWAN/NB-IoT", is_mandatory=True, created_at=_dt(2026, 1, 22)),
            ChallengeRequirement(challenge_id=ch2.id, req_type="security", key="encryption", value="AES-256 at rest, TLS 1.3 in transit", is_mandatory=True, created_at=_dt(2026, 1, 22)),
            ChallengeRequirement(challenge_id=ch2.id, req_type="financial", key="budget_within_range", value="1Cr-3Cr", is_mandatory=True, created_at=_dt(2026, 1, 22)),
            ChallengeRequirement(challenge_id=ch2.id, req_type="pilot", key="pilot_location", value="Pune Municipal Corporation", is_mandatory=True, created_at=_dt(2026, 1, 22)),
        ]
        reqs_ch3 = [
            ChallengeRequirement(challenge_id=ch3.id, req_type="eligibility", key="dpiit_registered", value="True", is_mandatory=True, created_at=_dt(2026, 1, 25)),
            ChallengeRequirement(challenge_id=ch3.id, req_type="technical", key="abdm_compliance", value="Must integrate with ABDM", is_mandatory=True, created_at=_dt(2026, 1, 25)),
            ChallengeRequirement(challenge_id=ch3.id, req_type="technical", key="offline_first", value="Must work without internet 7+ days", is_mandatory=True, created_at=_dt(2026, 1, 25)),
            ChallengeRequirement(challenge_id=ch3.id, req_type="security", key="hipaa_aligned", value="Patient data privacy", is_mandatory=True, created_at=_dt(2026, 1, 25)),
            ChallengeRequirement(challenge_id=ch3.id, req_type="financial", key="budget_within_range", value="25L-75L", is_mandatory=True, created_at=_dt(2026, 1, 25)),
            ChallengeRequirement(challenge_id=ch3.id, req_type="language", key="marathi_ui", value="Must support Marathi interface", is_mandatory=True, created_at=_dt(2026, 1, 25)),
        ]
        s.add_all(reqs_ch1 + reqs_ch2 + reqs_ch3)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 14. EVALUATIONS — 12 with 36+ EvaluationScore records (Apr 2026)
        # ════════════════════════════════════════════════════════════════
        eval_data = [
            (ch5.id, startup2.id, 8, 9, 7, 8, 8, 7),
            (ch1.id, startup1.id, 9, 8, 8, 7, 8, 8),
            (ch3.id, startup3.id, 7, 9, 7, 8, 7, 9),
            (ch2.id, startup2.id, 8, 8, 7, 9, 8, 7),
            (ch6.id, startup2.id, 7, 8, 6, 7, 8, 8),
            (ch7.id, startup1.id, 6, 7, 7, 8, 7, 6),
            (ch5.id, startup1.id, 7, 8, 7, 8, 7, 8),
            (ch1.id, startup2.id, 8, 7, 8, 7, 8, 7),
            (ch3.id, startup1.id, 7, 8, 7, 8, 7, 8),
            (ch6.id, startup3.id, 8, 9, 7, 7, 8, 8),
            (ch4.id, startup3.id, 7, 8, 8, 7, 8, 7),
            (ch2.id, startup1.id, 6, 7, 7, 8, 7, 7),
        ]
        evaluations = []
        all_eval_scores = []
        for idx, (cid, sid, tf, imp, ce, sc, tc, dp) in enumerate(eval_data):
            ev = Evaluation(
                challenge_id=cid, startup_id=sid, evaluator_id=evaluator.id,
                scores={"technical_feasibility": tf, "impact_potential": imp,
                        "cost_efficiency": ce, "scalability": sc,
                        "team_capability": tc, "data_privacy_compliance": dp},
                recommendation={"proceed": tf >= 7, "conditions": ["IS audit required"]},
                comments=f"Expert evaluation #{idx+1} — overall strong performance.",
                evaluated_at=_dt(2026, 4, 5 + idx),
                meta={"round": idx + 1},
                created_at=_dt(2026, 4, 5 + idx), updated_at=_dt(2026, 4, 5 + idx),
            )
            evaluations.append(ev)
            s.add(ev)
            s.flush()

            criteria = [
                ("technical_feasibility", 0.25, tf),
                ("impact_potential", 0.25, imp),
                ("cost_efficiency", 0.15, ce),
                ("scalability", 0.15, sc),
                ("team_capability", 0.10, tc),
                ("data_privacy_compliance", 0.10, dp),
            ]
            for crit_name, weight, score_val in criteria:
                es = EvaluationScore(
                    evaluation_id=ev.id, criterion=crit_name,
                    weight=weight, score=float(score_val),
                    created_at=_dt(2026, 4, 5 + idx),
                )
                all_eval_scores.append(es)
        s.add_all(all_eval_scores)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 15. PILOTS — 10 (May 2026)
        # ════════════════════════════════════════════════════════════════
        pilot1 = Pilot(
            challenge_id=ch1.id, startup_id=startup1.id, duration_weeks=16,
            scope="Deploy CropSafe AI platform for 500 smallholder farmers in Pune district. Includes Marathi voice-based chatbot, weather API integration, pest/disease alerts.",
            budget="750000",
            data_clauses={"farmer_data_consent": "Written consent in Marathi",
                          "data_localization": "India-only servers (AWS Mumbai)",
                          "anonymization": "Farm-level aggregation",
                          "data_retention": "5 years post-pilot"},
            ip_clauses={"government_license": "Royalty-free license for Maharashtra government use",
                        "startup_ip_retained": "Startup retains core IP and model weights",
                        "co_development": "Joint IP for government-specific adaptations"},
            cybersecurity_requirements="Annual IS audit by CERT-In empaneled auditor; AES-256 encryption; TLS 1.3 in transit; incident response plan within 24 hours.",
            risk_management={"technical": "low", "operational": "medium", "financial": "low", "regulatory": "low"},
            status="in_progress",
            start_date=_dt(2026, 6, 1), end_date=_dt(2026, 9, 30),
            owner_id=govt_officer.id,
            budget_utilization_pct=33.3, actual_spend="250000",
            meta={"target_farmers": 500, "districts": ["Pune"],
                  "farmer_training": "Via 25 SHGs", "support_channel": "WhatsApp + helpline in Marathi"},
            created_at=_dt(2026, 5, 1), updated_at=_dt(2026, 5, 1),
        )
        pilot2 = Pilot(
            challenge_id=ch3.id, startup_id=startup3.id, duration_weeks=20,
            scope="Deploy MediConnect Rural digital health records platform across 20 PHCs in Nagpur division. Offline-first, ABDM-compatible, Marathi UI.",
            budget="500000",
            data_clauses={"patient_data_privacy": "HIPAA-aligned, ABDM compliant",
                          "data_localization": "India-only, ABDM Health Information Exchange",
                          "consent_management": "Digital consent via ABDM",
                          "data_retention": "As per ABDM guidelines"},
            ip_clauses={"co_developed_ip": "Joint ownership of ABDM integration layer",
                        "startup_ip_retained": "Core platform IP with startup"},
            cybersecurity_requirements="ABDM compliance certification; encryption; role-based access; audit logging.",
            risk_management={"technical": "medium", "operational": "high", "financial": "low"},
            status="approved",
            owner_id=govt_officer.id,
            meta={"target_phcs": 20, "division": "Nagpur",
                  "abdm_integration": "Health ID + Health Information Exchange"},
            created_at=_dt(2026, 5, 5), updated_at=_dt(2026, 5, 5),
        )
        pilot3 = Pilot(
            challenge_id=ch6.id, startup_id=startup2.id, duration_weeks=28,
            scope="Deploy 50 IoT water quality monitoring stations along Godavari basin. Real-time BOD, COD, pH, TDS monitoring with automated alerts.",
            budget="1200000",
            data_clauses={"environmental_data": "Public data, open access",
                          "location_data": "GPS coordinates of stations",
                          "calibration_records": "Monthly calibration logs"},
            ip_clauses={"government_license": "Full access to data and analytics",
                        "startup_ip_retained": "Sensor hardware designs retained"},
            cybersecurity_requirements="Secure MQTT protocol; encrypted dashboard; role-based access.",
            risk_management={"technical": "low", "operational": "medium", "financial": "low"},
            status="proposed",
            owner_id=govt_officer.id,
            meta={"monitoring_stations": 50, "river_segment": "Nagpur to Nanded",
                  "parameters": ["pH", "BOD", "COD", "TDS"]},
            created_at=_dt(2026, 5, 10), updated_at=_dt(2026, 5, 10),
        )
        s.add_all([pilot1, pilot2, pilot3])
        s.flush()

        # 7 more pilots from extra apps
        pilot_apps = extra_apps[:7]
        extra_pilots = []
        for i, ap in enumerate(pilot_apps):
            p = Pilot(
                challenge_id=ap.challenge_id, startup_id=ap.startup_id,
                duration_weeks=12 + (i % 3) * 4,
                scope=f"Pilot for {ap.proposal[:100]}",
                budget=str((i + 1) * 100000),
                status=["in_progress", "approved", "proposed"][i % 3],
                owner_id=govt_officer.id,
                data_clauses={"data_localization": "India-only"},
                ip_clauses={"government_license": "Royalty-free for Maharashtra"},
                cybersecurity_requirements="Standard CERT-In compliance.",
                risk_management={"technical": "low", "operational": "medium"},
                start_date=_dt(2026, 6, 1 + i * 3),
                end_date=_dt(2026, 8, 1 + i * 3),
                budget_utilization_pct=round(10 + i * 8, 1),
                actual_spend=str((i + 1) * 30000),
                meta={"phase": i + 1},
                created_at=_dt(2026, 5, 15 + i),
                updated_at=_dt(2026, 5, 15 + i),
            )
            extra_pilots.append(p)
        s.add_all(extra_pilots)
        s.flush()

        all_pilots = [pilot1, pilot2, pilot3] + extra_pilots

        # ════════════════════════════════════════════════════════════════
        # 16. PILOT MILESTONES — 20 (2 per pilot)
        # ════════════════════════════════════════════════════════════════
        all_milestones = []
        milestone_configs = [
            (pilot1, [
                ("Platform Deployment & Farmer Onboarding", "Deploy CropSafe AI Marathi interface; onboard 500 farmers through 25 SHGs", "250000", "completed", _dt(2026, 7, 15), _dt(2026, 7, 12), "approved"),
                ("Field Pilot — 500 Farmer Season Cycle", "Run advisory through one Kharif season; collect daily usage data", "250000", "pending", _dt(2026, 8, 31), None, "pending"),
            ]),
            (pilot2, [
                ("PHC Deployment Phase", "Deploy across 8 PHCs in Nagpur division", "200000", "completed", _dt(2026, 7, 20), _dt(2026, 7, 18), "approved"),
                ("ABDM Integration & Scaling", "Complete ABDM certification and deploy to remaining 12 PHCs", "300000", "pending", _dt(2026, 9, 15), None, "pending"),
            ]),
            (pilot3, [
                ("Sensor Deployment Phase 1", "Deploy 25 IoT monitoring stations along Godavari", "400000", "in_progress", _dt(2026, 8, 15), None, "pending"),
                ("Full Network Activation", "Deploy remaining 25 stations; activate dashboard", "800000", "pending", _dt(2026, 10, 30), None, "pending"),
            ]),
        ]
        for pilot, milestones in milestone_configs:
            for title, desc, amt, pstatus, due, completed, approval in milestones:
                ms = PilotMilestone(
                    pilot_id=pilot.id, title=title, description=desc,
                    deliverables={"status": pstatus},
                    payment_amount=amt, payment_status="completed" if pstatus == "completed" else "pending",
                    due_date=due, completed_date=completed,
                    approval_status=approval,
                    approved_by=govt_officer.id if approval == "approved" else None,
                    approved_at=completed if approval == "approved" else None,
                    created_at=_dt(2026, 5, 20), updated_at=_dt(2026, 5, 20),
                )
                all_milestones.append(ms)
        # 14 more milestones for extra pilots
        for p in extra_pilots:
            for j in range(2):
                ms = PilotMilestone(
                    pilot_id=p.id, title=f"Milestone {j+1} — {p.startup_id}",
                    description=f"Deliverable phase {j+1} for pilot {p.id}",
                    deliverables={"phase": j+1},
                    payment_amount=str(int(p.budget or "0") // 2),
                    payment_status="completed" if j == 0 else "pending",
                    due_date=_dt(2026, 7 if j == 0 else 8, 15 if j == 0 else 30),
                    completed_date=_dt(2026, 7, 10) if j == 0 else None,
                    approval_status="approved" if j == 0 else "pending",
                    approved_by=govt_officer.id if j == 0 else None,
                    approved_at=_dt(2026, 7, 11) if j == 0 else None,
                    created_at=_dt(2026, 5, 20), updated_at=_dt(2026, 5, 20),
                )
                all_milestones.append(ms)
        s.add_all(all_milestones)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 17. PAYMENTS
        # ════════════════════════════════════════════════════════════════
        payments = []
        for p in all_milestones:
            if p.payment_status == "completed":
                pay = Payment(
                    pilot_id=p.pilot_id, milestone_id=p.id,
                    amount=p.payment_amount, currency="INR",
                    invoice_number=f"INV/MH/{p.pilot_id}/{p.id:04d}",
                    invoice_date=p.completed_date or _dt(2026, 7, 15),
                    payment_status="completed",
                    payment_date=(p.completed_date or _dt(2026, 7, 20)),
                    transaction_id=f"MHGOV/UPI/2026{p.id:04d}",
                    created_at=_dt(2026, 7, 20), updated_at=_dt(2026, 7, 20),
                )
                payments.append(pay)
        s.add_all(payments)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 18. PILOT METRICS — 40 (4 per pilot)
        # ════════════════════════════════════════════════════════════════
        metric_templates = {
            pilot1.id: [
                ("farmers_onboarded", "Total farmers onboarded to CropSafe AI", "farmers", "0", "500", "320"),
                ("app_daily_active_users", "Average daily active users", "users", "0", "400", "285"),
                ("yield_improvement_pct", "Yield improvement vs control group", "%", "0", "20", "18"),
                ("advisory_accuracy_pct", "Accuracy of AI advisory", "%", "0", "85", "82"),
            ],
            pilot2.id: [
                ("phcs_deployed", "PHCs with platform deployed", "PHCs", "0", "20", "8"),
                ("patients_registered", "Total patients registered", "patients", "0", "5000", "2200"),
                ("abdm_integration_pct", "ABDM integration completed", "%", "0", "100", "60"),
                ("consultation_turnaround_hrs", "Avg consultation turnaround", "hours", "0", "4", "6"),
            ],
            pilot3.id: [
                ("stations_deployed", "IoT stations deployed", "stations", "0", "50", "12"),
                ("data_points_daily", "Daily data points collected", "points", "0", "10000", "3600"),
                ("alert_accuracy", "Contamination alert accuracy", "%", "0", "95", "88"),
                ("uptime_pct", "Sensor network uptime", "%", "0", "99", "96"),
            ],
        }
        all_metrics = []
        for pid, metrics in metric_templates.items():
            for name, desc, unit, base, target, actual in metrics:
                m = PilotMetric(
                    pilot_id=pid, name=name, description=desc,
                    unit=unit, baseline_value=base, target_value=target,
                    actual_value=actual, status="tracking",
                    created_at=_dt(2026, 6, 10), updated_at=_dt(2026, 7, 10),
                )
                all_metrics.append(m)
        for p in extra_pilots:
            for j in range(4):
                m = PilotMetric(
                    pilot_id=p.id, name=f"kpi_{j+1}_pilot{p.id}",
                    description=f"KPI metric {j+1} for pilot {p.id}",
                    unit=["count", "%", "score", "hours"][j],
                    baseline_value="0", target_value=str(50 + j * 25),
                    actual_value=str(30 + j * 15), status="tracking",
                    created_at=_dt(2026, 6, 15), updated_at=_dt(2026, 7, 15),
                )
                all_metrics.append(m)
        s.add_all(all_metrics)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 19. PILOT EVIDENCE — 15 (Jul 2026)
        # ════════════════════════════════════════════════════════════════
        evidence_configs = [
            (pilot1.id, all_milestones[0].id, "SHG Partnership Agreements", "Signed partnership agreements with 25 SHGs", "document", startup1.owner_id),
            (pilot1.id, all_milestones[0].id, "Farmer Onboarding Report — Month 1", "Monthly report of farmer onboarding progress", "report", startup1.owner_id),
            (pilot1.id, all_milestones[0].id, "Platform Uptime Report — June 2026", "Server uptime metrics", "data", startup1.owner_id),
            (pilot2.id, all_milestones[2].id, "PHC Deployment Status — Nagpur", "Status of platform deployment across PHCs", "report", startup3.owner_id),
            (pilot2.id, all_milestones[2].id, "ABDM Integration Certificate", "Certificate of ABDM integration", "document", startup3.owner_id),
            (pilot3.id, all_milestones[4].id, "IoT Sensor Calibration Logs", "Calibration records for first 12 stations", "data", startup2.owner_id),
            (pilot3.id, all_milestones[4].id, "Water Quality Baseline Report", "Baseline water quality readings from Godavari", "report", startup2.owner_id),
            (pilot1.id, all_milestones[1].id, "Mid-Pilot Farmer Survey Results", "Survey of 200 farmers on platform satisfaction", "report", startup1.owner_id),
            (pilot2.id, all_milestones[3].id, "ABDM Certification Application", "Submitted application for ABDM certification", "document", startup3.owner_id),
            (pilot3.id, all_milestones[5].id, "Government Dashboard Demo", "Demo of MahaWater portal integration", "document", startup2.owner_id),
            (pilot1.id, all_milestones[1].id, "Weekly Usage Analytics — July", "Usage analytics from CropSafe AI platform", "data", startup1.owner_id),
            (pilot2.id, all_milestones[3].id, "PHC Staff Training Report", "Training completion records for PHC staff", "report", startup3.owner_id),
            (pilot3.id, all_milestones[4].id, "Satellite Connectivity Test Results", "Connectivity test results for remote stations", "data", startup2.owner_id),
            (pilot1.id, all_milestones[0].id, "IMD Weather API Integration Report", "Documentation of weather API integration", "document", startup1.owner_id),
            (pilot2.id, all_milestones[2].id, "Offline Mode Validation Report", "Results of 7-day offline mode testing", "report", startup3.owner_id),
        ]
        all_evidence = []
        for pid, mid, title, desc, etype, uid in evidence_configs:
            e = PilotEvidence(
                pilot_id=pid, milestone_id=mid, title=title, description=desc,
                evidence_type=etype,
                file_url=f"/evidence/pilot{pid}/{etype}_{mid}.pdf",
                submitted_by=uid,
                created_at=_dt(2026, 7, 10),
            )
            all_evidence.append(e)
        s.add_all(all_evidence)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 20. PILOT INCIDENTS — 8
        # ════════════════════════════════════════════════════════════════
        incidents = [
            PilotIncident(pilot_id=pilot1.id, title="Farmer data consent form discrepancy",
                          description="12 consent forms missing Marathi translation as required",
                          severity="medium", status="resolved",
                          reported_by=startup1.owner_id, resolved_at=_dt(2026, 7, 5),
                          resolution="Forms re-issued with Marathi translation",
                          created_at=_dt(2026, 7, 1), updated_at=_dt(2026, 7, 5)),
            PilotIncident(pilot_id=pilot1.id, title="Platform downtime — 6 hours",
                          description="CropSafe AI platform experienced 6-hour outage due to AWS region issue",
                          severity="high", status="resolved",
                          reported_by=startup1.owner_id, resolved_at=_dt(2026, 7, 15),
                          resolution="Failover to secondary AWS region activated",
                          created_at=_dt(2026, 7, 12), updated_at=_dt(2026, 7, 15)),
            PilotIncident(pilot_id=pilot2.id, title="ABDM API version mismatch",
                          description="ABDM API endpoint changed, causing integration failures",
                          severity="high", status="resolved",
                          reported_by=startup3.owner_id, resolved_at=_dt(2026, 7, 22),
                          resolution="Updated to ABDM v3.2 API endpoints",
                          created_at=_dt(2026, 7, 18), updated_at=_dt(2026, 7, 22)),
            PilotIncident(pilot_id=pilot2.id, title="PHC staff resistance to digital system",
                          description="Staff at 3 PHCs refusing to use digital records system",
                          severity="medium", status="in_progress",
                          reported_by=startup3.owner_id,
                          resolution="Additional training sessions scheduled",
                          created_at=_dt(2026, 7, 20), updated_at=_dt(2026, 7, 20)),
            PilotIncident(pilot_id=pilot3.id, title="Sensor battery drain in remote locations",
                          description="5 of 12 sensors ran out of battery within 2 weeks",
                          severity="medium", status="resolved",
                          reported_by=startup2.owner_id, resolved_at=_dt(2026, 7, 28),
                          resolution="Upgraded to high-capacity lithium batteries, 6-month life",
                          created_at=_dt(2026, 7, 25), updated_at=_dt(2026, 7, 28)),
            PilotIncident(pilot_id=pilot1.id, title="Marathi voice recognition accuracy",
                          description="Voice advisory accuracy drops to 60% for rural Marathi dialects",
                          severity="medium", status="in_progress",
                          reported_by=startup1.owner_id,
                          resolution="Fine-tuning model with Vidarbha dialect data",
                          created_at=_dt(2026, 7, 28), updated_at=_dt(2026, 7, 28)),
            PilotIncident(pilot_id=pilot3.id, title="Data dashboard access control issue",
                          description="Government dashboard showing restricted data to unauthorized users",
                          severity="high", status="resolved",
                          reported_by=govt_officer.id, resolved_at=_dt(2026, 8, 2),
                          resolution="Access control rules updated, audit completed",
                          created_at=_dt(2026, 7, 30), updated_at=_dt(2026, 8, 2)),
            PilotIncident(pilot_id=pilot2.id, title="Patient data migration errors",
                          description="15% of paper records had data entry errors during digitization",
                          severity="low", status="resolved",
                          reported_by=startup3.owner_id, resolved_at=_dt(2026, 8, 5),
                          resolution="Implemented double-entry verification for remaining records",
                          created_at=_dt(2026, 8, 1), updated_at=_dt(2026, 8, 5)),
        ]
        s.add_all(incidents)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 21. VALIDATIONS — 8 (one per completed pilot)
        # ════════════════════════════════════════════════════════════════
        validations = [
            Validation(
                pilot_id=pilot1.id, validator_id=validator.id,
                outcome="conditional", recommendation="procure",
                kpi_achievement_pct=78.5, cost_efficiency_pct=85.0,
                security_score=8.2, scalability_score=7.5,
                evidence_review="Reviewed all 3 evidence submissions. Platform uptime 99.2%. Farmer onboarding 64% of target.",
                rationale="Strong technical performance. Farmer adoption slower than expected due to digital literacy barriers.",
                validated_at=_dt(2026, 7, 25),
                created_at=_dt(2026, 7, 25), updated_at=_dt(2026, 7, 25),
            ),
            Validation(
                pilot_id=pilot2.id, validator_id=validator.id,
                outcome="success", recommendation="scale",
                kpi_achievement_pct=65.0, cost_efficiency_pct=78.0,
                security_score=9.0, scalability_score=8.0,
                evidence_review="ABDM integration partially complete. PHC deployment at 40%. Offline-first architecture validated.",
                rationale="Solid foundation. Recommend scaling to remaining 12 PHCs.",
                validated_at=_dt(2026, 7, 20),
                created_at=_dt(2026, 7, 20), updated_at=_dt(2026, 7, 20),
            ),
            Validation(
                pilot_id=all_pilots[3].id, validator_id=validator.id,
                outcome="success", recommendation="scale",
                kpi_achievement_pct=72.0, cost_efficiency_pct=80.0,
                security_score=7.8, scalability_score=7.0,
                evidence_review="Initial deployment metrics positive. Team capability verified.",
                rationale="Recommend continuation to Phase 2.",
                validated_at=_dt(2026, 7, 28),
                created_at=_dt(2026, 7, 28), updated_at=_dt(2026, 7, 28),
            ),
            Validation(
                pilot_id=all_pilots[4].id, validator_id=validator.id,
                outcome="conditional", recommendation="conditional_procure",
                kpi_achievement_pct=60.0, cost_efficiency_pct=70.0,
                security_score=7.5, scalability_score=6.5,
                evidence_review="Metrics tracking in progress. Some KPIs behind target.",
                rationale="Recommend conditional approval with enhanced monitoring.",
                validated_at=_dt(2026, 7, 30),
                created_at=_dt(2026, 7, 30), updated_at=_dt(2026, 7, 30),
            ),
            Validation(
                pilot_id=all_pilots[5].id, validator_id=validator.id,
                outcome="success", recommendation="scale",
                kpi_achievement_pct=82.0, cost_efficiency_pct=88.0,
                security_score=8.5, scalability_score=8.0,
                evidence_review="Strong performance across all metrics. Data quality excellent.",
                rationale="Recommend state-wide rollout.",
                validated_at=_dt(2026, 8, 1),
                created_at=_dt(2026, 8, 1), updated_at=_dt(2026, 8, 1),
            ),
            Validation(
                pilot_id=all_pilots[6].id, validator_id=validator.id,
                outcome="pending", recommendation="pending",
                kpi_achievement_pct=55.0, cost_efficiency_pct=65.0,
                security_score=7.0, scalability_score=6.0,
                evidence_review="Pilot in early stage. Insufficient data for final verdict.",
                rationale="Awaiting additional evidence before final assessment.",
                validated_at=_dt(2026, 8, 5),
                created_at=_dt(2026, 8, 5), updated_at=_dt(2026, 8, 5),
            ),
            Validation(
                pilot_id=all_pilots[7].id, validator_id=validator.id,
                outcome="success", recommendation="procure",
                kpi_achievement_pct=75.0, cost_efficiency_pct=82.0,
                security_score=8.0, scalability_score=7.5,
                evidence_review="Pilot completed successfully. All key metrics met.",
                rationale="Recommend procurement of full solution.",
                validated_at=_dt(2026, 8, 8),
                created_at=_dt(2026, 8, 8), updated_at=_dt(2026, 8, 8),
            ),
            Validation(
                pilot_id=all_pilots[8].id, validator_id=validator.id,
                outcome="conditional", recommendation="conditional_procure",
                kpi_achievement_pct=68.0, cost_efficiency_pct=75.0,
                security_score=7.8, scalability_score=7.0,
                evidence_review="Pilot shows promise but needs performance optimization.",
                rationale="Conditional approval with 30-day performance improvement window.",
                validated_at=_dt(2026, 8, 10),
                created_at=_dt(2026, 8, 10), updated_at=_dt(2026, 8, 10),
            ),
        ]
        s.add_all(validations)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 22. PROCUREMENTS — 6 (Aug 2026)
        # ════════════════════════════════════════════════════════════════
        procurements = [
            Procurement(pilot_id=pilot1.id, status="approved",
                        procurement_method="GeM Direct Procurement",
                        estimated_value="750000", approved_value="700000",
                        approving_authority="Dr. Rajesh Patil, Joint Secretary, DSE",
                        approval_status="approved",
                        external_reference_type="GeM", external_reference_id="MH/GEM/2026/4521",
                        created_at=_dt(2026, 8, 1), updated_at=_dt(2026, 8, 1)),
            Procurement(pilot_id=pilot2.id, status="recommended",
                        procurement_method="Restricted Tender",
                        estimated_value="500000", approval_status="pending",
                        created_at=_dt(2026, 8, 3), updated_at=_dt(2026, 8, 3)),
            Procurement(pilot_id=pilot3.id, status="recommended",
                        procurement_method="GeM Auction",
                        estimated_value="1200000", approval_status="pending",
                        created_at=_dt(2026, 8, 5), updated_at=_dt(2026, 8, 5)),
            Procurement(pilot_id=all_pilots[3].id, status="approved",
                        procurement_method="GeM Direct Procurement",
                        estimated_value="200000", approved_value="180000",
                        approving_authority="Meera Sharma, Procurement Officer",
                        approval_status="approved",
                        external_reference_type="GeM", external_reference_id="MH/GEM/2026/4601",
                        created_at=_dt(2026, 8, 8), updated_at=_dt(2026, 8, 8)),
            Procurement(pilot_id=all_pilots[4].id, status="recommended",
                        procurement_method="Limited Tender",
                        estimated_value="300000", approval_status="pending",
                        created_at=_dt(2026, 8, 10), updated_at=_dt(2026, 8, 10)),
            Procurement(pilot_id=all_pilots[5].id, status="approved",
                        procurement_method="GeM Direct Procurement",
                        estimated_value="400000", approved_value="380000",
                        approving_authority="Dr. Rajesh Patil, Joint Secretary, DSE",
                        approval_status="approved",
                        external_reference_type="GeM", external_reference_id="MH/GEM/2026/4650",
                        created_at=_dt(2026, 8, 12), updated_at=_dt(2026, 8, 12)),
        ]
        s.add_all(procurements)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 23. CONTRACTS — 4 (Aug 2026)
        # ════════════════════════════════════════════════════════════════
        contracts = [
            Contract(pilot_id=pilot1.id, contract_number="MSPA/DSE/CropSafe/2026/001",
                     status="signed", signed_date=_dt(2026, 8, 5),
                     expiry_date=_dt(2027, 2, 5), value="700000",
                     created_at=_dt(2026, 8, 5), updated_at=_dt(2026, 8, 5)),
            Contract(pilot_id=pilot2.id, contract_number="MSPA/DSE/MediConnect/2026/002",
                     status="draft", value="500000",
                     created_at=_dt(2026, 8, 8), updated_at=_dt(2026, 8, 8)),
            Contract(pilot_id=all_pilots[3].id, contract_number="MSPA/DSE/Pilot3/2026/003",
                     status="signed", signed_date=_dt(2026, 8, 10),
                     expiry_date=_dt(2027, 2, 10), value="180000",
                     created_at=_dt(2026, 8, 10), updated_at=_dt(2026, 8, 10)),
            Contract(pilot_id=all_pilots[5].id, contract_number="MSPA/DSE/Pilot5/2026/004",
                     status="draft", value="380000",
                     created_at=_dt(2026, 8, 15), updated_at=_dt(2026, 8, 15)),
        ]
        s.add_all(contracts)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 24. PURCHASE ORDERS — 4 (Aug 2026)
        # ════════════════════════════════════════════════════════════════
        pos = [
            PurchaseOrder(contract_id=contracts[0].id, po_number="PO/MH/DSE/2026/00451",
                          status="issued", amount="250000",
                          issued_date=_dt(2026, 8, 8),
                          created_at=_dt(2026, 8, 8), updated_at=_dt(2026, 8, 8)),
            PurchaseOrder(contract_id=contracts[0].id, po_number="PO/MH/DSE/2026/00452",
                          status="draft", amount="250000",
                          issued_date=_dt(2026, 8, 15),
                          created_at=_dt(2026, 8, 15), updated_at=_dt(2026, 8, 15)),
            PurchaseOrder(contract_id=contracts[2].id, po_number="PO/MH/DSE/2026/00460",
                          status="issued", amount="180000",
                          issued_date=_dt(2026, 8, 12),
                          created_at=_dt(2026, 8, 12), updated_at=_dt(2026, 8, 12)),
            PurchaseOrder(contract_id=contracts[3].id, po_number="PO/MH/DSE/2026/00470",
                          status="draft", amount="380000",
                          created_at=_dt(2026, 8, 18), updated_at=_dt(2026, 8, 18)),
        ]
        s.add_all(pos)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 25. GRIEVANCES — 8 (Aug 2026)
        # ════════════════════════════════════════════════════════════════
        grievances = [
            Grievance(startup_id=startup1.id, challenge_id=ch1.id, pilot_id=pilot1.id,
                      category="procurement", subject="Delayed payment for Milestone 1",
                      description="Payment of INR 2,50,000 for Milestone 1 approved on 13 July but not received after 30 days.",
                      status="in_progress", assigned_to=govt_officer.id, sla_days=15,
                      created_at=_dt(2026, 8, 1), updated_at=_dt(2026, 8, 1)),
            Grievance(startup_id=startup2.id, challenge_id=ch2.id,
                      category="pilot", subject="SCADA integration API access delayed",
                      description="PMC has not provided SCADA API credentials as committed.",
                      status="open", sla_days=10,
                      created_at=_dt(2026, 8, 3), updated_at=_dt(2026, 8, 3)),
            Grievance(startup_id=startup3.id, challenge_id=ch3.id, pilot_id=pilot2.id,
                      category="pilot", subject="PHC staff training delays",
                      description="Training sessions at 3 PHCs rescheduled multiple times by local authorities.",
                      status="open", assigned_to=govt_officer.id, sla_days=10,
                      created_at=_dt(2026, 8, 5), updated_at=_dt(2026, 8, 5)),
            Grievance(startup_id=startup1.id, challenge_id=ch1.id, pilot_id=pilot1.id,
                      category="technical", subject="AWS billing dispute",
                      description="AWS India billing did not reflect government discount as per agreement.",
                      status="resolved", assigned_to=govt_officer.id,
                      resolution="AWS applied government discount retroactively. Refund of INR 15,000 processed.",
                      created_at=_dt(2026, 8, 7), updated_at=_dt(2026, 8, 12)),
            Grievance(startup_id=startup2.id, challenge_id=ch6.id, pilot_id=pilot3.id,
                      category="procurement", subject="GeM registration delay",
                      description="GeM portal registration pending for 3 weeks, blocking procurement process.",
                      status="in_progress", assigned_to=procurement_officer.id, sla_days=10,
                      created_at=_dt(2026, 8, 8), updated_at=_dt(2026, 8, 8)),
            Grievance(startup_id=startup3.id, challenge_id=ch3.id, pilot_id=pilot2.id,
                      category="other", subject="Data privacy concern from PHC patients",
                      description="Patients raising concerns about digital health data storage. Need clear communication strategy.",
                      status="open", assigned_to=govt_officer.id, sla_days=15,
                      created_at=_dt(2026, 8, 10), updated_at=_dt(2026, 8, 10)),
            Grievance(startup_id=startup1.id, challenge_id=ch1.id, pilot_id=pilot1.id,
                      category="pilot", subject="Farmer subsidy integration pending",
                      description="State government subsidy scheme integration promised but not yet provided.",
                      status="open", assigned_to=govt_officer.id, sla_days=15,
                      created_at=_dt(2026, 8, 12), updated_at=_dt(2026, 8, 12)),
            Grievance(startup_id=all_startups[3].id, challenge_id=ch2.id, pilot_id=all_pilots[3].id,
                      category="contract", subject="Contract terms clarification needed",
                      description="Need clarification on IP ownership clause in draft contract.",
                      status="open", assigned_to=procurement_officer.id, sla_days=10,
                      created_at=_dt(2026, 8, 15), updated_at=_dt(2026, 8, 15)),
        ]
        s.add_all(grievances)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 26. IP DATA AGREEMENTS — 6
        # ════════════════════════════════════════════════════════════════
        ip_agreements = [
            IPDataAgreement(
                pilot_id=pilot1.id,
                background_ip="Startup retains all pre-existing IP including CropSafe AI platform",
                foreground_ip="Joint ownership of Maharashtra-specific crop advisory dataset",
                data_ownership="Farmer-level data anonymized. Government gets aggregated analytics.",
                data_access="Government: read access to dashboards. Startup: full access.",
                data_retention="5 years post-pilot.",
                confidentiality="Both parties maintain confidentiality of proprietary information.",
                model_source_code="Startup retains ownership. Government gets perpetual license to outputs.",
                exit_terms="Return/destroy all government data within 30 days. Startup retains anonymized analytics.",
                created_at=_dt(2026, 5, 20), updated_at=_dt(2026, 5, 20),
            ),
            IPDataAgreement(
                pilot_id=pilot2.id,
                background_ip="Startup retains MediConnect platform IP",
                foreground_ip="Joint ownership of ABDM integration layer",
                data_ownership="Patient data per ABDM guidelines. Anonymized data for research.",
                data_access="Government: dashboard access. Startup: operational access.",
                data_retention="As per ABDM guidelines.",
                confidentiality="Patient data classified as 'Restricted'.",
                model_source_code="Joint ownership of ABDM integration code.",
                exit_terms="Full data migration to ABDM within 60 days.",
                created_at=_dt(2026, 5, 25), updated_at=_dt(2026, 5, 25),
            ),
            IPDataAgreement(
                pilot_id=pilot3.id,
                background_ip="Startup retains sensor hardware IP",
                foreground_ip="Government owns water quality dataset",
                data_ownership="Environmental data is public. Sensor data analytics shared.",
                data_access="Open access for researchers and government.",
                data_retention="Indefinite for environmental data.",
                confidentiality="Station locations may be sensitive.",
                model_source_code="Startup retains analytics platform. Government gets license.",
                exit_terms="Sensor removal within 30 days. Data remains with government.",
                created_at=_dt(2026, 5, 30), updated_at=_dt(2026, 5, 30),
            ),
            IPDataAgreement(
                pilot_id=all_pilots[3].id,
                background_ip="Startup retains all pre-existing IP",
                foreground_ip="Joint IP for Maharashtra-specific adaptations",
                data_ownership="Anonymized operational data. Government gets analytics.",
                data_access="Government: read access. Startup: full operational access.",
                data_retention="3 years post-pilot.",
                confidentiality="Standard government confidentiality requirements.",
                model_source_code="Startup retains model. Government gets usage license.",
                exit_terms="Data return within 30 days of termination.",
                created_at=_dt(2026, 6, 5), updated_at=_dt(2026, 6, 5),
            ),
            IPDataAgreement(
                pilot_id=all_pilots[4].id,
                background_ip="Startup retains platform IP",
                foreground_ip="Government owns pilot-specific data outputs",
                data_ownership="Operational data shared equally.",
                data_access="Government: full access. Startup: operational access.",
                data_retention="5 years post-pilot.",
                confidentiality="Standard NDA terms apply.",
                model_source_code="Startup retains models. Government gets deployment license.",
                exit_terms="Full data handover within 30 days.",
                created_at=_dt(2026, 6, 10), updated_at=_dt(2026, 6, 10),
            ),
            IPDataAgreement(
                pilot_id=all_pilots[5].id,
                background_ip="Startup retains all IP",
                foreground_ip="Joint IP for government-specific features",
                data_ownership="Government owns aggregated analytics. Startup retains individual-level data.",
                data_access="Government: analytics dashboard. Startup: full access.",
                data_retention="3 years post-pilot.",
                confidentiality="Government data classified as 'Confidential'.",
                model_source_code="Startup retains source. Government gets perpetual usage rights.",
                exit_terms="Destroy government data within 30 days. Anonymized data may be retained.",
                created_at=_dt(2026, 6, 15), updated_at=_dt(2026, 6, 15),
            ),
        ]
        s.add_all(ip_agreements)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 27. CONFLICT OF INTEREST — 4
        # ════════════════════════════════════════════════════════════════
        cois = [
            ConflictOfInterest(evaluator_id=evaluator.id, application_id=app1.id,
                               has_conflict=False,
                               declaration="No conflict. No financial or professional relationship with CropSafe AI.",
                               created_at=_dt(2026, 4, 1)),
            ConflictOfInterest(evaluator_id=evaluator.id, application_id=app2.id,
                               has_conflict=False,
                               declaration="No conflict. No financial or professional relationship with WaterLens Technologies.",
                               created_at=_dt(2026, 4, 2)),
            ConflictOfInterest(evaluator_id=evaluator.id, application_id=app3.id,
                               has_conflict=False,
                               declaration="No conflict. No financial or professional relationship with MediConnect Rural.",
                               created_at=_dt(2026, 4, 3)),
            ConflictOfInterest(evaluator_id=evaluator.id, application_id=all_apps[3].id,
                               has_conflict=True,
                               declaration="Former colleague at WaterLens Technologies. Recused from scoring financial criteria.",
                               created_at=_dt(2026, 4, 4)),
        ]
        s.add_all(cois)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 28. COMPLIANCE CHECKLIST — 12
        # ════════════════════════════════════════════════════════════════
        checklist_items = []
        for proc in procurements[:3]:
            items = [
                ("GeM registration verified", "completed"),
                ("Budget allocation confirmed", "completed"),
                ("Technical sanction obtained", "completed"),
                ("NIT/RAK published", "pending"),
                ("Bid evaluation completed", "pending"),
                ("Contract award approval", "pending"),
            ]
            for item, status in items:
                cc = ComplianceChecklist(
                    procurement_id=proc.id, item=item, status=status,
                    checked_by=procurement_officer.id if status == "completed" else None,
                    notes="Verified per procurement guidelines" if status == "completed" else "",
                    created_at=_dt(2026, 8, 1), updated_at=_dt(2026, 8, 5),
                )
                checklist_items.append(cc)
        s.add_all(checklist_items)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 29. DOCUMENT VERSIONS — 10
        # ════════════════════════════════════════════════════════════════
        doc_versions = []
        for i, st in enumerate([startup1, startup2, startup3] + startup_records[:7]):
            dv = DocumentVersion(
                record_id=st.id, version=1,
                filename=f"{st.title.replace(' ', '_').lower()}_proposal_v1.pdf",
                file_url=f"/documents/{st.id}/proposal_v1.pdf",
                uploaded_by=st.owner_id,
                change_summary=f"Initial proposal submission for {st.title}",
                created_at=_dt(2026, 3, 10 + i),
            )
            doc_versions.append(dv)
        s.add_all(doc_versions)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 30. CHALLENGE VERSIONS — 6
        # ════════════════════════════════════════════════════════════════
        challenge_versions = []
        for ch in [ch1, ch2, ch3, ch4, ch5, ch6]:
            cv = ChallengeVersion(
                challenge_id=ch.id, version=1,
                snapshot={"title": ch.title, "description": ch.description,
                          "budget_range": ch.budget_range, "status": ch.status},
                changed_by=govt_officer.id,
                change_summary=f"Initial creation of {ch.title}",
                created_at=_dt(2026, 1, 20),
            )
            challenge_versions.append(cv)
        s.add_all(challenge_versions)
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 31. SCALE-UP DECISIONS
        # ════════════════════════════════════════════════════════════════
        scale1 = ScaleUpDecision(
            pilot_id=pilot1.id, decision="scale",
            decided_by=govt_officer.id, decided_at=_dt(2026, 7, 14),
            target_departments=["dept_da", "dept_dse", "dept_dit"],
            budget_allocation="1500000",
            rationale="Milestone 1 completed. Platform stable, 98.5% uptime. Recommend scaling to 5,000 farmers.",
            meta={"next_phase": "Phase 2 — 5000 farmers, 3 districts",
                  "target_districts": ["Pune", "Nashik", "Ahmednagar"],
                  "budget_breakdown": {"platform_scaling": 600000, "farmer_training": 400000,
                                       "monitoring_evaluation": 300000, "contingency": 200000},
                  "timeline": "Rabi season (Oct 2026 - Mar 2027)"},
            created_at=_dt(2026, 7, 14), updated_at=_dt(2026, 7, 14),
        )
        scale2 = ScaleUpDecision(
            pilot_id=pilot2.id, decision="scale",
            decided_by=govt_officer.id, decided_at=_dt(2026, 7, 22),
            target_departments=["dept_dh"],
            budget_allocation="800000",
            rationale="ABDM integration partially complete. Recommend scaling to remaining PHCs.",
            created_at=_dt(2026, 7, 22), updated_at=_dt(2026, 7, 22),
        )
        s.add_all([scale1, scale2])
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 32. TEMPLATES — keep all 4 existing
        # ════════════════════════════════════════════════════════════════
        tpl1 = Template(
            name="Maharashtra Startup Procurement Agreement (MSPA)",
            type="contract", version="2.0", is_active=True,
            content={
                "sections": [
                    {"title": "Preamble", "body": "This Agreement is entered into pursuant to Government Resolution No. [GR No.] dated [Date] under the Maharashtra Startup Policy 2017 (as amended 2022)."},
                    {"title": "Parties", "body": "Department: [Name], Government of Maharashtra (\"Client\") and Startup: [Name], DPIIT-registered (\"Vendor\")."},
                    {"title": "Scope of Work", "body": "As per Technical Sanction and RFP Annexure-A."},
                    {"title": "Duration", "body": "[X] weeks from date of Agreement execution."},
                    {"title": "Budget & Payments", "body": "Total: INR [Amount] (inclusive of GST). Milestone-based payments as per Annexure-B."},
                    {"title": "Data Protection", "body": "Compliance with Digital Personal Data Protection Act 2023. Data localization in India."},
                    {"title": "Intellectual Property", "body": "Government gets irrevocable, royalty-free license for Maharashtra state use. Startup retains core IP."},
                    {"title": "Cybersecurity", "body": "IS audit by CERT-In empaneled auditor. Encryption per CERT-In directives."},
                    {"title": "Termination", "body": "30-day notice. Immediate termination for breach."},
                    {"title": "Dispute Resolution", "body": "Arbitration under Arbitration & Conciliation Act 1996, seat Mumbai."},
                ],
            },
            meta={"department": "DSE", "gr_reference": "GR No. 2021/122/M-58",
                  "policy": "Maharashtra Startup Policy 2017 (amended 2022)"},
            created_at=_dt(2026, 1, 5), updated_at=_dt(2026, 1, 5),
        )
        tpl2 = Template(
            name="Maharashtra Government Expert Evaluation Scorecard",
            type="evaluation", version="1.0", is_active=True,
            content={
                "criteria": [
                    {"name": "Technical Feasibility", "weight": 0.25, "scale": "1-10"},
                    {"name": "Impact Potential", "weight": 0.25, "scale": "1-10"},
                    {"name": "Cost Efficiency", "weight": 0.15, "scale": "1-10"},
                    {"name": "Scalability", "weight": 0.15, "scale": "1-10"},
                    {"name": "Team Capability", "weight": 0.10, "scale": "1-10"},
                    {"name": "Data & Privacy Compliance", "weight": 0.10, "scale": "1-10"},
                ],
                "passing_score": 6.5, "min_experts": 3, "max_evaluators": 5,
                "evaluation_window_days": 30,
            },
            meta={"department": "General", "policy": "Maharashtra Procurement Guidelines"},
            created_at=_dt(2026, 1, 5), updated_at=_dt(2026, 1, 5),
        )
        tpl3 = Template(
            name="Maharashtra Government RFP for Startup Solutions",
            type="rfp", version="1.0", is_active=True,
            content={
                "sections": [
                    {"title": "Background & Context", "body": "Problem statement and policy alignment with Maharashtra Startup Policy 2017."},
                    {"title": "Objectives & KPIs", "body": "Expected outcomes with measurable KPIs."},
                    {"title": "Eligibility", "body": "DPIIT-registered startups. Maharashtra-based preferred."},
                    {"title": "Technical Requirements", "body": "Must support Marathi/Hindi. Data localization mandatory."},
                    {"title": "Submission Guidelines", "body": "Technical proposal (max 50 pages) + Financial proposal."},
                    {"title": "Evaluation Process", "body": "Two-stage: Technical (70%) + Financial (30%)."},
                    {"title": "Commercial Terms", "body": "Milestone-based payments. 30-day payment cycle."},
                    {"title": "Legal & Compliance", "body": "Maharashtra Startup Policy, DPDP Act 2023, IT Act 2000."},
                ],
            },
            meta={"department": "General", "policy": "Maharashtra Procurement Policy for Startups"},
            created_at=_dt(2026, 1, 5), updated_at=_dt(2026, 1, 5),
        )
        tpl4 = Template(
            name="NDA for Government-Startup Pilot Programs",
            type="nda", version="1.0", is_active=True,
            content={
                "sections": [
                    {"title": "Parties", "body": "Government of Maharashtra department and Startup entity."},
                    {"title": "Definition of Confidential Information", "body": "Government data, startup IP, pilot data, evaluation reports."},
                    {"title": "Obligations", "body": "Each party shall protect CI with minimum reasonable care."},
                    {"title": "Exclusions", "body": "Publicly available info, independently developed info."},
                    {"title": "Duration", "body": "2 years from date of execution."},
                    {"title": "Return of Information", "body": "Return or destroy all CI within 30 days."},
                ],
            },
            meta={"department": "General"},
            created_at=_dt(2026, 1, 5), updated_at=_dt(2026, 1, 5),
        )
        s.add_all([tpl1, tpl2, tpl3, tpl4])
        s.flush()

        # ════════════════════════════════════════════════════════════════
        # 33. AUDIT TRAIL — 200+ entries spread Jan-Aug 2026
        # ════════════════════════════════════════════════════════════════

        # Jan 2026 — Infrastructure setup
        for r in [r1, r2]:
            audit(s, admin, "seeded", r)

        audit_entity(s, admin.id, "template", tpl1.id, "created", {"title": tpl1.name})
        audit_entity(s, admin.id, "template", tpl2.id, "created", {"title": tpl2.name})
        audit_entity(s, admin.id, "template", tpl3.id, "created", {"title": tpl3.name})
        audit_entity(s, admin.id, "template", tpl4.id, "created", {"title": tpl4.name})
        audit_entity(s, govt_officer.id, "department", dept_dse.id, "created", {"name": dept_dse.name})
        audit_entity(s, govt_officer.id, "department", dept_dit.id, "created", {"name": dept_dit.name})
        audit_entity(s, govt_officer.id, "department", dept_da.id, "created", {"name": dept_da.name})
        audit_entity(s, govt_officer.id, "department", dept_dh.id, "created", {"name": dept_dh.name})
        audit_entity(s, govt_officer.id, "department", dept_du.id, "created", {"name": dept_du.name})
        audit_entity(s, govt_officer.id, "department", dept_de.id, "created", {"name": dept_de.name})
        audit_entity(s, govt_officer.id, "department", dept_dwd.id, "created", {"name": dept_dwd.name})

        # Jan 2026 — District records
        for dr in district_records:
            audit_entity(s, govt_officer.id, "record", dr.id, "created", {"kind": "district", "title": dr.title})

        # Jan 2026 — Schemes
        for sc in scheme_records:
            audit_entity(s, govt_officer.id, "record", sc.id, "created", {"kind": "scheme", "title": sc.title})

        # Jan 2026 — Incubators
        for ic in incubator_records:
            audit_entity(s, incubator_user.id, "record", ic.id, "created", {"kind": "incubator", "title": ic.title})

        # Jan 2026 — Mentor user registrations
        for mu in mentor_users:
            audit_entity(s, admin.id, "user", mu.id, "registered", {"name": mu.name, "role": "mentor"})

        # Jan 2026 — Challenge requirements
        for req in reqs_ch1 + reqs_ch2 + reqs_ch3:
            audit_entity(s, govt_officer.id, "challenge_requirement", req.id, "created", {"key": req.key})

        # Jan 2026 — Challenge versions
        for cv in challenge_versions:
            audit_entity(s, govt_officer.id, "challenge_version", cv.id, "created", {"challenge_id": cv.challenge_id})

        # Feb 2026 — Startups registered
        for st in startup_records:
            audit_entity(s, st.owner_id, "record", st.id, "created", {"kind": "startup", "title": st.title})

        # Feb 2026 — Research projects
        for rp in research_records:
            audit_entity(s, rp.owner_id, "record", rp.id, "created", {"kind": "research", "title": rp.title})

        # Feb 2026 — Innovations
        for inv in innovation_records:
            audit_entity(s, inv.owner_id, "record", inv.id, "created", {"kind": "innovation", "title": inv.title})

        # Feb 2026 — Patents
        for pt in patent_records:
            audit_entity(s, pt.owner_id, "record", pt.id, "created", {"kind": "patent", "title": pt.title})

        # Mar 2026 — Applications
        for ap in all_apps:
            audit_entity(s, ap.startup_id, "application", ap.id, "created", {"title": f"Application for challenge {ap.challenge_id}"})

        # Mar 2026 — Eligibility checks
        for ec in [ec1, ec2, ec3]:
            audit_entity(s, govt_officer.id, "eligibility_check", ec.id, "created", {"result": ec.result})

        # Apr 2026 — Evaluations
        for ev in evaluations:
            audit_entity(s, evaluator.id, "evaluation", ev.id, "submitted", {"challenge_id": ev.challenge_id})

        # Apr 2026 — Evaluation scores
        for es in all_eval_scores:
            audit_entity(s, evaluator.id, "evaluation_score", es.id, "created", {"criterion": es.criterion, "score": es.score})

        # Apr 2026 — Conflict of interest
        for coi in cois:
            audit_entity(s, evaluator.id, "conflict_of_interest", coi.id, "declared", {"has_conflict": coi.has_conflict})

        # May 2026 — Pilots
        for p in all_pilots:
            audit_entity(s, govt_officer.id, "pilot", p.id, "created", {"status": p.status, "startup_id": p.startup_id})

        # May 2026 — IP agreements
        for ipa in ip_agreements:
            audit_entity(s, govt_officer.id, "ip_data_agreement", ipa.id, "created", {"pilot_id": ipa.pilot_id})

        # May 2026 — Scale-up decisions
        for sd in [scale1, scale2]:
            audit_entity(s, govt_officer.id, "scale_up_decision", sd.id, "created", {"decision": sd.decision})

        # Jun 2026 — Pilot milestones
        for ms in all_milestones:
            audit_entity(s, govt_officer.id, "pilot_milestone", ms.id, "created", {"title": ms.title})

        # Jun 2026 — Pilot metrics
        for pm in all_metrics:
            audit_entity(s, govt_officer.id, "pilot_metric", pm.id, "created", {"name": pm.name})

        # Jul 2026 — Evidence submissions
        for pe in all_evidence:
            audit_entity(s, pe.submitted_by, "pilot_evidence", pe.id, "submitted", {"title": pe.title})

        # Jul 2026 — Validations
        for val in validations:
            audit_entity(s, validator.id, "validation", val.id, "completed", {"outcome": val.outcome})

        # Jul 2026 — Incidents
        for inc in incidents:
            audit_entity(s, inc.reported_by, "pilot_incident", inc.id, "reported", {"title": inc.title, "severity": inc.severity})

        # Jul 2026 — Payments
        for pay in payments:
            audit_entity(s, govt_officer.id, "payment", pay.id, "completed", {"amount": pay.amount, "pilot_id": pay.pilot_id})

        # Aug 2026 — Procurements
        for proc in procurements:
            audit_entity(s, govt_officer.id, "procurement", proc.id, "created", {"method": proc.procurement_method, "status": proc.status})

        # Aug 2026 — Compliance checklists
        for cc in checklist_items:
            audit_entity(s, procurement_officer.id, "compliance_checklist", cc.id, "checked", {"item": cc.item, "status": cc.status})

        # Aug 2026 — Contracts
        for con in contracts:
            audit_entity(s, govt_officer.id, "contract", con.id, "created", {"number": con.contract_number, "status": con.status})

        # Aug 2026 — Purchase orders
        for po in pos:
            audit_entity(s, procurement_officer.id, "purchase_order", po.id, "created", {"number": po.po_number, "amount": po.amount})

        # Aug 2026 — Document versions
        for dv in doc_versions:
            audit_entity(s, dv.uploaded_by, "document_version", dv.id, "uploaded", {"filename": dv.filename})

        # Aug 2026 — Grievances
        for gr in grievances:
            audit_entity(s, gr.startup_id, "grievance", gr.id, "created", {"subject": gr.subject, "status": gr.status})

        # ════════════════════════════════════════════════════════════════
        # 34. NOTIFICATIONS — 40+
        # ════════════════════════════════════════════════════════════════
        # Platform initialized
        notify(s, admin.id, "System initialized with Maharashtra data. 36 districts, 15 schemes, 12 incubators loaded.", "system")
        notify(s, govt_officer.id, "7 challenges published across Maharashtra departments. 10 pilots active.", "system")

        # Mentor onboarding
        notify(s, mentor.id, "20 new mentors added to Maharashtra ecosystem. Mentoring opportunities available.", "info")
        notify(s, incubator_user.id, "12 incubators registered. Partnership opportunities in AgriTech, IoT, HealthTech.", "info")

        # Startup ecosystem
        notify(s, investor.id, "50 startups in Maharashtra ecosystem seeking funding across multiple sectors.", "info")

        # Application notifications
        for ap in all_apps[:5]:
            notify(s, ap.startup_id, f"Your application for challenge {ap.challenge_id} is now {ap.status}.", "info")

        # Evaluation notifications
        notify(s, evaluator.id, "12 evaluations completed for Maharashtra challenges. Evaluation scores recorded.", "info")
        for ev in evaluations[:3]:
            notify(s, evaluator.id, f"Evaluation submitted for challenge {ev.challenge_id}. Review criteria scores.", "action")

        # Pilot notifications
        notify(s, govt_officer.id, "10 pilots proposed/approved across Maharashtra. 4 pilots in progress.", "system")
        for p in all_pilots[:5]:
            notify(s, p.owner_id, f"Pilot {p.id} status: {p.status}. Start date: {p.start_date}.", "info")

        # Milestone notifications
        for ms in all_milestones[:6]:
            notify(s, govt_officer.id, f"Milestone '{ms.title}' — status: {ms.approval_status}.", "info")

        # Evidence notifications
        for pe in all_evidence[:5]:
            notify(s, pe.submitted_by, f"Evidence submitted: {pe.title}. Pending validation.", "info")

        # Validation notifications
        for val in validations[:3]:
            notify(s, val.validator_id, f"Validation completed for pilot {val.pilot_id}. Outcome: {val.outcome}.", "info")
            notify(s, govt_officer.id, f"Pilot {val.pilot_id} validation: {val.outcome}. Recommendation: {val.recommendation}.", "info")

        # Incident notifications
        for inc in incidents[:4]:
            notify(s, inc.reported_by, f"Incident reported: {inc.title}. Severity: {inc.severity}.", "warning")

        # Procurement notifications
        notify(s, procurement_officer.id, "6 procurement actions pending review. 3 approved, 3 recommended.", "action")
        for proc in procurements[:3]:
            notify(s, procurement_officer.id, f"Procurement for pilot {proc.pilot_id}: {proc.status}. Method: {proc.procurement_method}.", "info")

        # Contract & PO notifications
        notify(s, govt_officer.id, "4 contracts initiated. 2 signed, 2 in draft.", "info")
        notify(s, procurement_officer.id, "4 purchase orders created. 2 issued, 2 in draft.", "info")

        # Grievance notifications
        for gr in grievances[:4]:
            notify(s, gr.assigned_to or govt_officer.id, f"Grievance received: {gr.subject}. Category: {gr.category}. SLA: {gr.sla_days} days.", "warning")

        # IP agreement notifications
        for ipa in ip_agreements[:3]:
            notify(s, ipa.pilot_id, f"IP/Data agreement recorded for pilot {ipa.pilot_id}.", "info")

        # Scale-up notifications
        notify(s, govt_officer.id, f"Scale-up decision for pilot {pilot1.id}: {scale1.decision}. Budget: {scale1.budget_allocation}.", "info")
        notify(s, govt_officer.id, f"Scale-up decision for pilot {pilot2.id}: {scale2.decision}. Budget: {scale2.budget_allocation}.", "info")

        # Audit notifications
        notify(s, auditor.id, "200+ audit log entries recorded. Jan-Aug 2026 timeline complete.", "info")

        s.commit()
    finally:
        s.close()
