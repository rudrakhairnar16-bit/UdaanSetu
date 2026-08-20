import json
import logging
import os
import time
from typing import Any, Optional

logger = logging.getLogger("udaansetu.cache")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
CACHE_TTL = int(os.getenv("CACHE_TTL", "60"))

_cache: dict[str, tuple[float, str]] = {}
_redis = None


def _get_redis():
    global _redis
    if _redis is None:
        try:
            import redis  # type: ignore

            _redis = redis.from_url(REDIS_URL, socket_connect_timeout=1, socket_timeout=1)
            _redis.ping()
        except Exception:
            logger.info("Redis unavailable — using in-memory cache fallback")
            _redis = False
    return _redis or None


def cache_get(key: str) -> Optional[Any]:
    r = _get_redis()
    if r is not None:
        try:
            raw = r.get(f"udaansetu:{key}")
            return json.loads(raw) if raw else None
        except Exception:
            pass
    item = _cache.get(key)
    if not item:
        return None
    expires, payload = item
    if time.time() > expires:
        _cache.pop(key, None)
        return None
    return json.loads(payload)


def cache_set(key: str, value: Any, ttl: int = CACHE_TTL) -> None:
    payload = json.dumps(value, default=str)
    r = _get_redis()
    if r is not None:
        try:
            r.setex(f"udaansetu:{key}", ttl, payload)
            return
        except Exception:
            pass
    _cache[key] = (time.time() + ttl, payload)


def cache_clear_pattern(prefix: str) -> None:
    r = _get_redis()
    if r is not None:
        try:
            keys = r.keys(f"udaansetu:{prefix}*")
            if keys:
                r.delete(*keys)
            return
        except Exception:
            pass
    for k in list(_cache.keys()):
        if k.startswith(prefix):
            _cache.pop(k, None)


def cached(prefix: str, ttl: int = CACHE_TTL):
    def decorator(func):
        def wrapper(*args, **kwargs):
            key = prefix
            for value in kwargs.values():
                if value is not None and not callable(value):
                    key += f":{value}"
            hit = cache_get(key)
            if hit is not None:
                return hit
            result = func(*args, **kwargs)
            cache_set(key, result, ttl)
            return result

        return wrapper

    return decorator