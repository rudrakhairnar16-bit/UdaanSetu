from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/govt", tags=["government"])

class AadhaarVerify(BaseModel):
    aadhaar_number: str
    name: str = ""

class DigiLockerVerify(BaseModel):
    document_type: str
    document_id: str = ""

class StartupIndiaVerify(BaseModel):
    registration_number: str
    startup_name: str = ""

class IPIndiaVerify(BaseModel):
    application_number: str
    patent_title: str = ""

class IPIndiaSearch(BaseModel):
    query: str

class ONDCSearch(BaseModel):
    query: str = ""
    category: str = ""

class ONDCVerify(BaseModel):
    seller_id: str

@router.post("/aadhaar/verify")
async def verify_aadhaar(data: dict):
    return {"status": "verified", "message": "Mock Aadhaar verification", "data": data}

@router.post("/aadhaar/send-otp")
async def send_aadhaar_otp(data: dict):
    return {"status": "otp_sent", "message": "OTP sent to registered mobile"}

@router.post("/aadhaar/verify-otp")
async def verify_aadhaar_otp(data: dict):
    return {"status": "verified", "message": "OTP verified successfully"}

@router.post("/digilocker/verify")
async def verify_digilocker(data: dict):
    return {"status": "verified", "message": "Mock DigiLocker verification"}

@router.post("/startup-india/verify")
async def verify_startup_india(data: dict):
    return {"status": "verified", "message": "Mock Startup India verification"}

@router.get("/startup-india/benefits/{reg_number}")
async def get_startup_india_benefits(reg_number: str):
    return {"benefits": []}

@router.post("/ip-india/verify")
async def verify_ip_india(data: dict):
    return {"status": "verified", "message": "Mock IP India verification"}

@router.post("/ip-india/search")
async def search_ip_india(data: dict):
    return {"total_results": 0, "patents": []}

@router.post("/ondc/search")
async def search_ondc(data: dict):
    return {"products": []}

@router.post("/ondc/verify")
async def verify_ondc(data: dict):
    return {"status": "verified", "message": "Mock ONDC verification"}