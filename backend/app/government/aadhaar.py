"""Aadhaar eKYC integration (mock).

In production, replace with real UIDAI API calls:
- Sandbox: https://sandbox.ekyc.uidai.gov.in
- Production: Requires CIDR agency registration
"""
import hashlib
import time
import random

from app.government.base import BaseGovernmentClient


class AadhaarClient(BaseGovernmentClient):
    service_name = "aadhaar"

    async def verify(self, aadhaar_number: str = "", name: str = "", dob: str = "") -> dict:
        """Verify Aadhaar eKYC.

        In production, this sends an OTP to the linked mobile number
        and verifies the response from UIDAI servers.
        """
        if not aadhaar_number or len(aadhaar_number.replace(" ", "")) != 12:
            return self._mock_response(
                status="error",
                error="Invalid Aadhaar number format (must be 12 digits)",
            )

        # Mock: simulate KYC verification
        clean = aadhaar_number.replace(" ", "")
        masked = f"XXXX XXXX {clean[-4:]}"
        verified = random.random() > 0.1  # 90% success rate in demo

        if verified:
            return self._mock_response(
                status="verified",
                aadhaar_masked=masked,
                name_match=True,
                dob_match=True if dob else None,
                address="Mock Address, District, State - 000000",
                photo_available=True,
                gender=random.choice(["M", "F", "O"]),
                message=f"Aadhaar {masked} verified successfully (DEMO)",
            )
        else:
            return self._mock_response(
                status="failed",
                aadhaar_masked=masked,
                message="Aadhaar verification failed — name/dob mismatch (DEMO)",
            )

    async def send_otp(self, aadhaar_number: str) -> dict:
        """Send OTP to Aadhaar-linked mobile number."""
        clean = aadhaar_number.replace(" ", "")
        masked = f"XXXX XXXX {clean[-4:]}"
        return self._mock_response(
            status="otp_sent",
            aadhaar_masked=masked,
            message=f"OTP sent to mobile ending in {random.randint(1000, 9999)} (DEMO)",
        )

    async def verify_otp(self, aadhaar_number: str, otp: str) -> dict:
        """Verify OTP for Aadhaar eKYC."""
        if otp == "123456":
            return await self.verify(aadhaar_number=aadhaar_number)
        return self._mock_response(status="error", error="Invalid OTP (use 123456 in demo)")
