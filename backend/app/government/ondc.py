"""ONDC (Open Network for Digital Commerce) marketplace integration (mock).

In production, replace with real ONDC API calls:
- Network: https://sandbox.ondc.org/ondc-buyer/v2
- Requires ONDC network participant registration
"""
import random

from app.government.base import BaseGovernmentClient


class ONDCClient(BaseGovernmentClient):
    service_name = "ondc"

    CATEGORIES = [
        "Agricultural Products", "Handicrafts", "Textiles",
        "Food & Beverages", "Electronics", "Health & Wellness",
        "Education Services", "Professional Services",
    ]

    async def verify(self, seller_id: str = "", product_name: str = "") -> dict:
        """Verify a seller/product on ONDC network."""
        if not seller_id:
            return self._mock_response(status="error", error="Seller ID required")

        return self._mock_response(
            status="verified",
            seller_id=seller_id,
            product_name=product_name or f"Demo Product {random.randint(1, 100)}",
            ondc_participant=random.random() > 0.2,
            category=random.choice(self.CATEGORIES),
            rating=round(random.uniform(3.0, 5.0), 1),
            total_orders=random.randint(10, 500),
            message=f"Seller {'verified' if random.random() > 0.2 else 'not found'} on ONDC (DEMO)",
        )

    async def list_products(self, category: str = "", limit: int = 10) -> dict:
        """List products from ONDC network."""
        return self._mock_response(
            status="ok",
            category=category or "All",
            products=[
                {
                    "product_id": f"ONDC{random.randint(10000, 99999)}",
                    "name": f"Product {i+1}",
                    "category": random.choice(self.CATEGORIES),
                    "price": round(random.uniform(100, 50000), 2),
                    "seller": f"Seller {random.randint(1, 50)}",
                    "rating": round(random.uniform(3.0, 5.0), 1),
                    "in_stock": random.random() > 0.2,
                }
                for i in range(min(limit, 20))
            ],
        )

    async def search_products(self, query: str, limit: int = 10) -> dict:
        """Search products on ONDC."""
        return self._mock_response(
            status="ok",
            query=query,
            total_results=random.randint(5, 100),
            products=[
                {
                    "product_id": f"ONDC{random.randint(10000, 99999)}",
                    "name": f"{query} result {i+1}",
                    "price": round(random.uniform(100, 50000), 2),
                    "seller": f"Seller {random.randint(1, 50)}",
                    "fulfillment": random.choice(["Standard", "Express", "Same Day"]),
                }
                for i in range(min(limit, 20))
            ],
        )

    async def register_seller(self, data: dict) -> dict:
        """Register a seller on ONDC network (mock)."""
        seller_id = f"SELL{random.randint(100000, 999999)}"
        return self._mock_response(
            status="registered",
            seller_id=seller_id,
            business_name=data.get("business_name", "New Business"),
            onboarding_status="pending_verification",
            message=f"Seller registered with ID {seller_id}. Verification pending. (DEMO)",
        )
