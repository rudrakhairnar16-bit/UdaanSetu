"""Government API integration routes.

Endpoints for:
- Aadhaar eKYC verification
- DigiLocker document verification
- Startup India registry
- IP India patent status
- ONDC marketplace
- Gujarat scheme eligibility
- District density analytics
"""
import json
import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, cast, String, text
from sqlalchemy.orm import Session
from typing import Optional

from app.dependencies import current, db
from app.models import Record
from app.government.aadhaar import AadhaarClient
from app.government.digilocker import DigiLockerClient
from app.government.startup_india import StartupIndiaClient
from app.government.ip_india import IPIndiaClient
from app.government.ondc import ONDCClient

router = APIRouter(prefix="/government", tags=["Government APIs"])
_log = logging.getLogger("udaansetu.gov.routes")

DATA_DIR = Path("/app/data")

# Singleton clients
_aadhaar = AadhaarClient()
_digilocker = DigiLockerClient()
_startup_india = StartupIndiaClient()
_ip_india = IPIndiaClient()
_ondc = ONDCClient()


# --- Request models ---

class AadhaarVerifyIn(BaseModel):
    aadhaar_number: str
    name: str = ""
    dob: str = ""

class AadhaarOTPIn(BaseModel):
    aadhaar_number: str
    otp: str

class DigiLockerVerifyIn(BaseModel):
    document_type: str
    document_id: str = ""
    user_name: str = ""

class StartupIndiaVerifyIn(BaseModel):
    registration_number: str
    startup_name: str = ""

class StartupIndiaRegisterIn(BaseModel):
    name: str
    sector: str = ""
    stage: str = "Idea"
    district: str = ""

class IPIndiaVerifyIn(BaseModel):
    application_number: str
    patent_title: str = ""

class IPIndiaSearchIn(BaseModel):
    query: str
    limit: int = 10

class ONDCVerifyIn(BaseModel):
    seller_id: str
    product_name: str = ""

class ONDCSearchIn(BaseModel):
    query: str
    limit: int = 10

class ONDCRegisterSellerIn(BaseModel):
    business_name: str
    category: str = ""


# --- Aadhaar eKYC ---

@router.post("/aadhaar/verify")
async def aadhaar_verify(body: AadhaarVerifyIn, user=Depends(current)):
    """Verify Aadhaar eKYC."""
    _log.info(f"Aadhaar verify requested by user {user.id}")
    return await _aadhaar.verify(
        aadhaar_number=body.aadhaar_number,
        name=body.name,
        dob=body.dob,
    )

@router.post("/aadhaar/send-otp")
async def aadhaar_send_otp(body: AadhaarVerifyIn, user=Depends(current)):
    """Send OTP to Aadhaar-linked mobile."""
    return await _aadhaar.send_otp(body.aadhaar_number)

@router.post("/aadhaar/verify-otp")
async def aadhaar_verify_otp(body: AadhaarOTPIn, user=Depends(current)):
    """Verify Aadhaar OTP."""
    return await _aadhaar.verify_otp(body.aadhaar_number, body.otp)


# --- DigiLocker ---

@router.post("/digilocker/verify")
async def digilocker_verify(body: DigiLockerVerifyIn, user=Depends(current)):
    """Verify a document through DigiLocker."""
    return await _digilocker.verify(
        document_type=body.document_type,
        document_id=body.document_id,
        user_name=body.user_name,
    )

@router.get("/digilocker/documents")
async def digilocker_documents(user=Depends(current)):
    """List available document types in DigiLocker."""
    return await _digilocker.list_documents()

@router.post("/digilocker/fetch")
async def digilocker_fetch(body: DigiLockerVerifyIn, user=Depends(current)):
    """Fetch a document from DigiLocker."""
    return await _digilocker.fetch_document(body.document_type, body.document_id)


# --- Startup India ---

@router.post("/startup-india/verify")
async def startup_india_verify(body: StartupIndiaVerifyIn, user=Depends(current)):
    """Verify startup on Startup India registry."""
    return await _startup_india.verify(
        registration_number=body.registration_number,
        startup_name=body.startup_name,
    )

@router.post("/startup-india/register")
async def startup_india_register(body: StartupIndiaRegisterIn, user=Depends(current)):
    """Register a new startup on Startup India."""
    return await _startup_india.register_startup({
        "name": body.name,
        "sector": body.sector,
        "stage": body.stage,
        "district": body.district,
    })

@router.get("/startup-india/benefits/{registration_number}")
async def startup_india_benefits(registration_number: str, user=Depends(current)):
    """Get available benefits for a registered startup."""
    return await _startup_india.get_benefits(registration_number)

@router.get("/startup-india/recent")
async def startup_india_recent(limit: int = 10, user=Depends(current)):
    """List recently registered startups."""
    return await _startup_india.list_recent(limit)


# --- IP India ---

@router.post("/ip-india/verify")
async def ip_india_verify(body: IPIndiaVerifyIn, user=Depends(current)):
    """Check patent application status."""
    return await _ip_india.verify(
        application_number=body.application_number,
        patent_title=body.patent_title,
    )

@router.post("/ip-india/search")
async def ip_india_search(body: IPIndiaSearchIn, user=Depends(current)):
    """Search patents by title, applicant, or IPC class."""
    return await _ip_india.search_patents(body.query, body.limit)

@router.get("/ip-india/publication/{application_number}")
async def ip_india_publication(application_number: str, user=Depends(current)):
    """Get patent publication details."""
    return await _ip_india.get_publication(application_number)

@router.get("/ip-india/costs/{filing_type}")
async def ip_india_costs(filing_type: str, user=Depends(current)):
    """Estimate patent filing costs."""
    return await _ip_india.estimate_costs(filing_type)


# --- ONDC ---

@router.post("/ondc/verify")
async def ondc_verify(body: ONDCVerifyIn, user=Depends(current)):
    """Verify a seller/product on ONDC network."""
    return await _ondc.verify(seller_id=body.seller_id, product_name=body.product_name)

@router.post("/ondc/search")
async def ondc_search(body: ONDCSearchIn, user=Depends(current)):
    """Search products on ONDC."""
    return await _ondc.search_products(body.query, body.limit)

@router.get("/ondc/products")
async def ondc_products(category: str = "", limit: int = 10, user=Depends(current)):
    """List products from ONDC network."""
    return await _ondc.list_products(category, limit)

@router.post("/ondc/register-seller")
async def ondc_register_seller(body: ONDCRegisterSellerIn, user=Depends(current)):
    """Register a seller on ONDC network."""
    return await _ondc.register_seller({"business_name": body.business_name, "category": body.category})


# --- Gujarat Scheme Eligibility Checker ---

class SchemeEligibilityIn(BaseModel):
    sector: str = ""
    stage: str = ""
    district: str = ""
    is_women_led: bool = False
    is_sc_st: bool = False
    is_youth: bool = False
    annual_revenue: float = 0
    employees: int = 0

@router.post("/gujarat/scheme-eligibility")
async def gujarat_scheme_eligibility(body: SchemeEligibilityIn, user=Depends(current)):
    """Check which Gujarat government schemes a startup is eligible for."""
    schemes_file = DATA_DIR / "gujarat_schemes.json"
    if not schemes_file.exists():
        return {"schemes": [], "message": "Scheme data not loaded"}

    with open(schemes_file) as f:
        all_schemes = json.load(f).get("schemes", [])

    eligible = []
    for scheme in all_schemes:
        reasons = []
        score = 0

        if scheme.get("sector") == "All" or not scheme.get("sector"):
            score += 30
            reasons.append("Open to all sectors")
        elif body.sector and body.sector.lower() in scheme.get("sector", "").lower():
            score += 50
            reasons.append(f"Sector-specific: {scheme['sector']}")

        if body.stage:
            scheme_stages = scheme.get("stage", [])
            if body.stage in scheme_stages:
                score += 30
                reasons.append(f"Stage matches: {body.stage}")

        if body.is_women_led and "women" in scheme.get("name", "").lower():
            score += 40
            reasons.append("Women entrepreneur special scheme")
        if body.is_sc_st and ("sc/st" in scheme.get("name", "").lower() or "tribal" in scheme.get("name", "").lower()):
            score += 40
            reasons.append("SC/ST/Tribal special scheme")
        if body.is_youth and "youth" in scheme.get("name", "").lower():
            score += 40
            reasons.append("Youth entrepreneur scheme")

        if score > 0:
            eligible.append({
                "id": scheme.get("id"),
                "name": scheme.get("name"),
                "description": scheme.get("description"),
                "budget": scheme.get("budget"),
                "benefit_type": scheme.get("benefit_type"),
                "eligibility": scheme.get("eligibility"),
                "apply_url": scheme.get("apply_url"),
                "eligibility_score": min(score, 100),
                "reasons": reasons,
            })

    eligible.sort(key=lambda x: x["eligibility_score"], reverse=True)
    return {"total_schemes": len(all_schemes), "eligible_count": len(eligible), "schemes": eligible}


# --- DPIIT Recognition Status Checker ---

@router.get("/gujarat/dpiit-status/{cin}")
async def gujarat_dpiit_status(cin: str, user=Depends(current), s: Session = Depends(db)):
    """Check DPIIT recognition status for a CIN number."""
    record = s.query(Record).filter(
        Record.kind == "startup",
        text("(meta->>'cin') = :cin")
    ).params(cin=cin).first()

    if not record:
        return {
            "found": False,
            "cin": cin,
            "status": "Not Found",
            "message": f"No startup found with CIN {cin} in Gujarat DPIIT registry",
        }

    meta = record.meta or {}
    return {
        "found": True,
        "cin": cin,
        "company_name": record.title,
        "legal_name": meta.get("legal_name", ""),
        "status": record.stage,
        "district": record.district,
        "sector": record.sector,
        "focus_sector": meta.get("focus_sector", ""),
        "website": meta.get("company_website", ""),
        "services": meta.get("services_provided", ""),
        "dpiit_recognized": True,
        "recognition_date": meta.get("data_as_on", ""),
        "state": "Gujarat",
    }


# --- District Density Analytics ---

@router.get("/gujarat/district-density")
async def gujarat_district_density(s: Session = Depends(db), user=Depends(current)):
    """Get startup density analytics for all Gujarat districts."""
    districts_file = DATA_DIR / "gujarat_districts.json"
    district_meta = {}
    if districts_file.exists():
        with open(districts_file) as f:
            for d in json.load(f).get("districts", []):
                district_meta[d["name"]] = d

    rows = (
        s.query(Record.district, func.count(Record.id))
        .filter(Record.kind == "startup", Record.district != "")
        .group_by(Record.district)
        .all()
    )

    result = []
    for district_name, count in rows:
        meta = district_meta.get(district_name, {})
        population = meta.get("population", 0)
        density = round(count / (population / 100000), 2) if population > 0 else 0

        result.append({
            "district": district_name,
            "startup_count": count,
            "population": population,
            "density_per_lakh": density,
            "area_sq_km": meta.get("area_sq_km", 0),
            "literacy_rate": meta.get("literacy_rate", 0),
            "gdp_contrib_pct": meta.get("gdp_contrib_pct", 0),
            "key_industries": meta.get("key_industries", []),
            "urban_pct": meta.get("urban_pct", 0),
        })

    result.sort(key=lambda x: x["startup_count"], reverse=True)
    total_startups = sum(r["startup_count"] for r in result)
    return {
        "total_startups": total_startups,
        "total_districts": len(result),
        "avg_density": round(total_startups / max(1, len(result)), 1),
        "districts": result,
    }
