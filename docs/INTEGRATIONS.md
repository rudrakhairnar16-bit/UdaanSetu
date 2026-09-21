# UdaanSetu — Government Integrations & Architecture Boundaries
**Status Specification**: Clear Distinction Between Live and Integration-Ready Protocols  

---

## 1. Integration Status Matrix

In strict adherence to truth-in-advertising and SIH evaluation standards, the status of all external and government interfaces is explicitly declared below:

| System / Provider | Target Capability | Current Implementation Status | Boundary Design |
|---|---|---|---|
| **DigiLocker** | Certificate & document verification | `Integration Ready / Mock` | REST API adapter with OAuth2 handshake stub in [backend/app/government](file:///c:/Users/Rudra/Desktop/UdaanSetu/backend/app/government) |
| **Aadhaar / UIDAI** | Founder KYC verification | `Integration Ready / Mock` | Sandbox mock endpoint returning simulated OTP & verification payload |
| **Startup India** | DPIIT registration verification | `Integration Ready / Mock` | API boundary checking DPIIT certification format with simulated response |
| **IP India** | Patent application status lookup | `Integration Ready / Mock` | Webhook receiver interface for patent status updates |
| **ONDC / GeM** | Public procurement catalog sync | `Integration Ready / Mock` | JSON schema aligned with GeM tender data format |
| **Ollama / DeepSeek**| Local LLM narrative generation | `Optional / Configurable` | Disabled by default (`OLLAMA_ENABLED=false`); seamlessly toggles if local Ollama daemon is active |

---

## 2. Integration Adapter Pattern

All external integrations utilize an adapter interface pattern to allow hot-swapping between sandbox mock data and live production endpoints without altering core business logic:

```python
class GovernmentAPIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.is_mock = not bool(base_url and api_key)

    async def verify_dpiit_status(self, entity_id: str) -> dict:
        if self.is_mock:
            # Deterministic, safe simulation for demo & evaluation
            return {
                "entity_id": entity_id,
                "verified": True,
                "status": "DPIIT_RECOGNIZED",
                "mode": "PROTOTYPE_SIMULATION"
            }
        # Real production request
        ...
```

This guarantees complete stability during hackathon demonstrations regardless of external government gateway uptime.
