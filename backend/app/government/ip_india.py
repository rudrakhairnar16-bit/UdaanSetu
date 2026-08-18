"""IP India patent status integration (mock).

In production, replace with real IP India API calls:
- Patent search: https://ipindiaservices.gov.in
- Requires controller of patents access
"""
import random

from app.government.base import BaseGovernmentClient


class IPIndiaClient(BaseGovernmentClient):
    service_name = "ip_india"

    PATENT_STATUSES = [
        "Filed", "Published", "Under Examination", "Hearing Scheduled",
        "Granted", "Rejected", "Abandoned", "Sealed",
    ]

    FILING_TYPES = [
        "Ordinary", "Convention", "PCT National Phase",
        "Patent of Addition", "Divisional",
    ]

    async def verify(self, application_number: str = "", patent_title: str = "") -> dict:
        """Check patent application status on IP India."""
        if not application_number:
            return self._mock_response(status="error", error="Application number required")

        status = random.choice(self.PATENT_STATUSES)
        filed_year = random.randint(2018, 2025)

        return self._mock_response(
            status="ok",
            application_number=application_number,
            patent_title=patent_title or f"Demo Patent {random.randint(1, 100)}",
            filing_date=f"{filed_year}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            publication_date=f"{filed_year + 1}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}" if filed_year < 2025 else None,
            current_status=status,
            filing_type=random.choice(self.FILING_TYPES),
            applicant=f"Demo Applicant {random.randint(1, 50)}",
            ipc_classifications=[f"A{random.randint(0, 9)}H{random.randint(10, 99)}", f"G{random.randint(0, 6)}F{random.randint(10, 99)}"],
            examination_requested=status not in ["Filed", "Published"],
            message=f"Patent application status: {status} (DEMO)",
        )

    async def search_patents(self, query: str, limit: int = 10) -> dict:
        """Search patents by title, applicant, or IPC class."""
        return self._mock_response(
            status="ok",
            query=query,
            total_results=random.randint(5, 50),
            patents=[
                {
                    "application_number": f"IN/{random.randint(2018, 2025)}/{random.randint(100000, 999999)}",
                    "title": f"Patent related to {query} #{i+1}",
                    "status": random.choice(self.PATENT_STATUSES),
                    "applicant": f"Applicant {i+1}",
                    "filing_date": f"20{random.randint(20, 25)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                }
                for i in range(min(limit, 20))
            ],
        )

    async def get_publication(self, application_number: str) -> dict:
        """Get patent publication details."""
        return self._mock_response(
            status="ok",
            application_number=application_number,
            published_in="Journal No. " + str(random.randint(1, 50)),
            publication_date=f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            pre_grant_opposition_window=True,
            opposition_deadline=f"2025-{random.randint(7, 12):02d}-{random.randint(1, 28):02d}",
        )

    async def estimate_costs(self, filing_type: str = "Ordinary") -> dict:
        """Estimate patent filing costs."""
        base_fees = {"Ordinary": 4000, "Convention": 8000, "PCT National Phase": 10000, "Patent of Addition": 2000, "Divisional": 4000}
        return self._mock_response(
            status="ok",
            filing_type=filing_type,
            official_fee=base_fees.get(filing_type, 4000),
            attorney_fee=random.randint(15000, 50000),
            total_estimated=base_fees.get(filing_type, 4000) + random.randint(15000, 50000),
            note="Costs are estimates. Actual fees depend on entity type and claims count. (DEMO)",
        )
