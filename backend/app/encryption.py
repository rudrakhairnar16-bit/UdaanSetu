import hashlib
import base64
from app.config import settings

def hash_sensitive_field(value: str) -> str:
    """One-way hash for sensitive fields like Aadhaar numbers."""
    return hashlib.sha256(f"{settings.secret_key}:{value}".encode()).hexdigest()

def mask_field(value: str, visible_chars: int = 4) -> str:
    """Mask a sensitive field showing only last N characters."""
    if len(value) <= visible_chars:
        return value
    return "*" * (len(value) - visible_chars) + value[-visible_chars:]
