"""Startup India registry integration (mock).

In production, replace with real Startup India API calls:
- API: https://api.startupindia.gov.in
- Requires DPIIT recognition certificate
"""
import random
import time

from app.government.base import BaseGovernmentClient


class StartupIndiaClient(BaseGovernmentClient):
    service_name = "startup_india"

    SECTORS = [
        "Agriculture", "Biotechnology", "Clean Energy", "Cloud Computing",
        "Cybersecurity", "Data Analytics", "E-Commerce", "EdTech",
        "FinTech", "HealthTech", "IoT", "Manufacturing",
        "Robotics", "SaaS", "Supply Chain", "Waste Management",
    ]

    STAGES = [
        "Idea", "Validation", "Minimum Viable Product", "Early Traction",
        "Revenue Generating", "Scaling", "Mature",
    ]

    async def verify(self, registration_number: str = "", startup_name: str = "") -> dict:
        """Verify startup registration on Startup India portal."""
        if not registration_number:
            return self._mock_response(status="error", error="Registration number required")

        verified = random.random() > 0.2

        return self._mock_response(
            status="verified" if verified else "not_found",
            registration_number=registration_number,
            startup_name=startup_name or f"Demo Startup {random.randint(1, 100)}",
            dpiit_recognized=verified,
            recognition_date=f"20{random.randint(20, 25)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            sector=random.choice(self.SECTORS),
            stage=random.choice(self.STAGES),
            message=f"Startup {'found' if verified else 'not found'} on Startup India registry (DEMO)",
        )

    async def register_startup(self, data: dict) -> dict:
        """Register a new startup on Startup India (mock)."""
        reg_num = f"SUP{random.randint(100000, 999999)}"
        return self._mock_response(
            status="registered",
            registration_number=reg_num,
            startup_name=data.get("name", "New Startup"),
            dpiit_recognized=True,
            message=f"Startup registered with number {reg_num} (DEMO)",
        )

    async def get_benefits(self, registration_number: str) -> dict:
        """Get available benefits for a registered startup."""
        return self._mock_response(
            status="ok",
            registration_number=registration_number,
            benefits=[
                {"name": "Tax Exemption (Section 80-IAC)", "status": random.choice(["eligible", "applied", "approved"])},
                {"name": "Self-Certification (Labour & Environmental)", "status": random.choice(["eligible", "applied"])},
                {"name": "Startup Fund of Funds", "status": random.choice(["eligible", "not_eligible"])},
                {"name": "Patent Filing Rebate (80%)", "status": random.choice(["eligible", "applied"])},
                {"name": "Winding Up (Fast-track)", "status": "eligible"},
            ],
            message="Benefits retrieved (DEMO data)",
        )

    async def list_recent(self, limit: int = 10) -> dict:
        """List recently registered startups (mock)."""
        return self._mock_response(
            status="ok",
            startups=[
                {
                    "registration_number": f"SUP{random.randint(100000, 999999)}",
                    "name": f"Demo Startup {i+1}",
                    "sector": random.choice(self.SECTORS),
                    "stage": random.choice(self.STAGES),
                    "dpiit_recognized": True,
                    "district": random.choice(["Bangalore Urban", "Pune", "Hyderabad", "Delhi", "Chennai"]),
                }
                for i in range(min(limit, 20))
            ],
        )
