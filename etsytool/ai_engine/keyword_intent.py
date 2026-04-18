import json
import time
from pathlib import Path
from urllib import request
from urllib.error import URLError, HTTPError

from django.conf import settings


STOP_WORDS = {"a", "an", "and", "day", "for", "gift", "of", "the", "to", "with"}

LOCAL_INTENT_MAP = {
    "mother": {
        "intent": "Mother's Day gift",
        "expandedKeywords": [
            "mother day",
            "mothers day",
            "mother's day",
            "mom gift",
            "gift for mom",
            "mama gift",
            "mom floral svg",
            "personalized name necklace",
            "custom mom necklace",
        ],
        "productAngles": ["personalized jewelry", "mom shirt", "floral svg", "gift mug"],
        "holidayFits": ["Mother's Day"],
    },
    "mom": {
        "intent": "Mother's Day gift",
        "expandedKeywords": [
            "mom gift",
            "gift for mom",
            "mama gift",
            "mother day",
            "mother's day",
            "mom floral svg",
            "personalized name necklace",
        ],
        "productAngles": ["personalized jewelry", "mom shirt", "floral svg"],
        "holidayFits": ["Mother's Day"],
    },
    "teacher": {
        "intent": "Teacher gift",
        "expandedKeywords": [
            "teacher gift",
            "teacher appreciation",
            "teacher appreciation png",
            "classroom gift",
            "school svg",
            "christmas teacher gift",
        ],
        "productAngles": ["teacher mug", "teacher shirt", "printable card", "ornament"],
        "holidayFits": ["Teacher Appreciation Week", "Christmas"],
    },
    "patch": {
        "intent": "Embroidered patch",
        "expandedKeywords": [
            "patch",
            "patches",
            "high quality patch",
            "cool patches",
            "denim patches",
            "embroidered patch",
            "jacket patch",
            "hat patch",
        ],
        "productAngles": ["jacket patch", "hat patch", "iron on patch"],
        "holidayFits": [],
    },
    "christmas": {
        "intent": "Christmas gift",
        "expandedKeywords": [
            "christmas",
            "xmas",
            "holiday gift",
            "christmas teacher gift",
            "ornament",
            "mug",
        ],
        "productAngles": ["ornament", "teacher gift", "holiday mug"],
        "holidayFits": ["Christmas"],
    },
    "xmas": {
        "intent": "Christmas gift",
        "expandedKeywords": [
            "xmas",
            "christmas",
            "holiday gift",
            "christmas teacher gift",
            "ornament",
        ],
        "productAngles": ["ornament", "teacher gift", "holiday mug"],
        "holidayFits": ["Christmas"],
    },
    "halloween": {
        "intent": "Halloween POD design",
        "expandedKeywords": [
            "halloween",
            "spooky",
            "ghost",
            "halloween ghost png",
            "pumpkin",
            "witch",
        ],
        "productAngles": ["png design", "shirt graphic", "sticker", "sublimation"],
        "holidayFits": ["Halloween"],
    },
    "zinnia": {
        "intent": "Garden seeds",
        "expandedKeywords": [
            "zinnia",
            "zinnia seeds",
            "peaches and cream zinnia seeds",
            "flower seeds",
            "garden seeds",
        ],
        "productAngles": ["seed packet", "flower seed", "garden gift"],
        "holidayFits": ["Spring gardening"],
    },
    "golf": {
        "intent": "Golf dad gift",
        "expandedKeywords": [
            "golf",
            "funny golf hat",
            "golf dad",
            "dad gift",
            "father day",
            "sports gift",
        ],
        "productAngles": ["golf hat", "dad shirt", "novelty gift"],
        "holidayFits": ["Father's Day"],
    },
}


def _tokenize(value):
    return [token for token in "".join(
        character.lower() if character.isalnum() else " "
        for character in str(value or "")
    ).split() if token and token not in STOP_WORDS]


def _cache_path():
    data_dir = Path(settings.DATA_ENGINE_DIR)
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "gemini_keyword_intent_cache.json"


def _read_cache():
    path = _cache_path()

    if not path.exists():
        return {}

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _write_cache(cache):
    path = _cache_path()
    path.write_text(json.dumps(cache, ensure_ascii=True, indent=2), encoding="utf-8")


def _normalize_result(query, result, source):
    expanded = []

    for value in [query, *result.get("expandedKeywords", [])]:
        normalized = str(value or "").strip().lower()

        if normalized and normalized not in expanded:
            expanded.append(normalized)

    return {
        "originalQuery": query,
        "intent": str(result.get("intent") or query or "General Etsy search").strip(),
        "expandedKeywords": expanded[:16],
        "productAngles": [str(item).strip() for item in result.get("productAngles", []) if str(item).strip()][:8],
        "holidayFits": [str(item).strip() for item in result.get("holidayFits", []) if str(item).strip()][:6],
        "source": source,
    }


def _local_expand(query):
    tokens = _tokenize(query)
    matched = []

    for token in tokens:
        if token in LOCAL_INTENT_MAP:
            matched.append(LOCAL_INTENT_MAP[token])

    if not matched:
        return _normalize_result(
            query,
            {
                "intent": query or "General Etsy search",
                "expandedKeywords": [query],
                "productAngles": [],
                "holidayFits": [],
            },
            "local",
        )

    expanded = []
    product_angles = []
    holiday_fits = []

    for item in matched:
        expanded.extend(item["expandedKeywords"])
        product_angles.extend(item["productAngles"])
        holiday_fits.extend(item["holidayFits"])

    return _normalize_result(
        query,
        {
            "intent": matched[0]["intent"],
            "expandedKeywords": expanded,
            "productAngles": product_angles,
            "holidayFits": holiday_fits,
        },
        "local",
    )


def _call_gemini(query):
    api_key = getattr(settings, "GEMINI_API_KEY", "")

    if not api_key or not getattr(settings, "GEMINI_INTENT_ENABLED", False):
        return None

    model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    prompt = (
        "Return only compact JSON for an Etsy seller keyword search. "
        "Schema: intent string, expandedKeywords array, productAngles array, holidayFits array. "
        "Expand misspellings and buyer intent, but do not invent sales metrics. "
        f"Query: {query}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=getattr(settings, "GEMINI_TIMEOUT_SECONDS", 6)) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        return None

    text = (
        response_payload.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def expand_keyword_query(query):
    cleaned_query = str(query or "").strip().lower()

    if not cleaned_query:
        return _normalize_result("", {"expandedKeywords": []}, "none")

    cache_key = cleaned_query
    cache = _read_cache()
    cached = cache.get(cache_key)
    now = int(time.time())
    ttl = getattr(settings, "GEMINI_INTENT_CACHE_TTL_SECONDS", 604800)

    if cached and now - int(cached.get("cachedAt", 0)) < ttl:
        cached_result = dict(cached.get("result", {}))
        cached_result["source"] = cached_result.get("source", "cache")
        return cached_result

    gemini_result = _call_gemini(cleaned_query)
    result = (
        _normalize_result(cleaned_query, gemini_result, "gemini")
        if gemini_result
        else _local_expand(cleaned_query)
    )

    if result["source"] == "gemini":
        cache[cache_key] = {"cachedAt": now, "result": result}
        _write_cache(cache)

    return result
