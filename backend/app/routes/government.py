"""Government API integration routes.

Endpoints for:
- Aadhaar eKYC verification
- DigiLocker document verification
- Startup India registry
- IP India patent status
- ONDC marketplace
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.dependencies import current
from app.government.aadhaar import AadhaarClient
from app.government.digilocker import DigiLockerClient
from app.government.startup_india import StartupIndiaClient
from app.government.ip_india import IPIndiaClient
from app.government.ondc import ONDCClient

router = APIRouter(prefix="/government", tags=["Government APIs"])
_log = logging.getLogger("udaansetu.gov.routes")

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
