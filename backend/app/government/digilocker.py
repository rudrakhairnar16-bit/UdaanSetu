"""DigiLocker document verification integration (mock).

In production, replace with real DigiLocker API calls:
- Sandbox: https://api.digitallocker.gov.in/public/oauth2/1
- Production: Requires NSDL registration
"""
import random

from app.government.base import BaseGovernmentClient


class DigiLockerClient(BaseGovernmentClient):
    service_name = "digilocker"

    DOCUMENT_TYPES = {
        "aadhaar": {"name": "Aadhaar Card", "issuer": "UIDAI", "validity": "Lifetime"},
        "pan": {"name": "PAN Card", "issuer": "Income Tax Department", "validity": "Lifetime"},
        "driving_license": {"name": "Driving License", "issuer": "Transport Authority", "validity": "20 years"},
        "voter_id": {"name": "Voter ID", "issuer": "Election Commission", "validity": "Lifetime"},
        "education_10th": {"name": "10th Marksheet", "issuer": "State Board", "validity": "Lifetime"},
        "education_12th": {"name": "12th Marksheet", "issuer": "State Board", "validity": "Lifetime"},
        "degree": {"name": "Degree Certificate", "issuer": "University", "validity": "Lifetime"},
        "registration_certificate": {"name": "Startup Registration", "issuer": "MCA / DPIIT", "validity": "Active"},
    }

    async def verify(self, document_type: str = "", document_id: str = "", user_name: str = "") -> dict:
        """Verify a document through DigiLocker.

        In production, this:
        1. Redirects user to DigiLocker OAuth
        2. Fetches the document XML/PDF
        3. Verifies the digital signature
        """
        if document_type not in self.DOCUMENT_TYPES:
            return self._mock_response(
                status="error",
                error=f"Unknown document type. Supported: {', '.join(self.DOCUMENT_TYPES.keys())}",
            )

        doc_info = self.DOCUMENT_TYPES[document_type]
        verified = random.random() > 0.15  # 85% success rate in demo

        return self._mock_response(
            status="verified" if verified else "failed",
            document_type=document_type,
            document_name=doc_info["name"],
            issuer=doc_info["issuer"],
            validity=doc_info["validity"],
            document_id=document_id or f"DL{random.randint(100000, 999999)}",
            verification_id=f"DLV{random.randint(100000, 999999)}",
            message=f"Document '{doc_info['name']}' {'verified' if verified else 'verification failed'} (DEMO)",
        )

    async def list_documents(self) -> dict:
        """List available document types in DigiLocker."""
        return self._mock_response(
            status="ok",
            documents=[
                {"type": k, "name": v["name"], "issuer": v["issuer"]}
                for k, v in self.DOCUMENT_TYPES.items()
            ],
        )

    async def fetch_document(self, document_type: str, document_id: str) -> dict:
        """Fetch a document from DigiLocker (mock)."""
        doc_info = self.DOCUMENT_TYPES.get(document_type, {})
        return self._mock_response(
            status="fetched",
            document_type=document_type,
            document_name=doc_info.get("name", "Unknown"),
            document_id=document_id,
            file_url=f"https://mock-digilocker.gov.in/docs/{document_id}.pdf",
            digital_signature_valid=True,
            message=f"Document fetched successfully (DEMO — mock URL)",
        )
