import json
from pathlib import Path

from django.conf import settings

from .normalizers import normalize_listing_record


def get_data_engine_dir():
    data_dir = Path(settings.DATA_ENGINE_DIR)
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def get_raw_dir():
    raw_dir = get_data_engine_dir() / "raw" / "apify"
    raw_dir.mkdir(parents=True, exist_ok=True)
    return raw_dir


def get_normalized_path():
    normalized_dir = get_data_engine_dir() / "normalized"
    normalized_dir.mkdir(parents=True, exist_ok=True)
    return normalized_dir / "listings.json"


def write_raw_run_items(run_id, items):
    raw_path = get_raw_dir() / f"{run_id}.jsonl"

    with raw_path.open("w", encoding="utf-8") as raw_file:
        for item in items:
            raw_file.write(json.dumps(item, ensure_ascii=False))
            raw_file.write("\n")

    return raw_path


def load_normalized_listings():
    normalized_path = get_normalized_path()

    if not normalized_path.exists():
        return []

    with normalized_path.open("r", encoding="utf-8") as normalized_file:
        payload = json.load(normalized_file)

    if isinstance(payload, list):
        return payload

    return payload.get("items", [])


def save_normalized_listings(listings):
    normalized_path = get_normalized_path()
    tmp_path = normalized_path.with_suffix(".tmp")

    with tmp_path.open("w", encoding="utf-8") as tmp_file:
        json.dump({"items": listings}, tmp_file, ensure_ascii=False, indent=2)

    tmp_path.replace(normalized_path)
    return normalized_path


def merge_listings(existing_listings, new_listings):
    merged = {}

    for listing in [*existing_listings, *new_listings]:
        listing_id = str(listing.get("listingId") or "").strip()
        listing_url = str(listing.get("listingUrl") or "").strip()
        key = listing_id or listing_url

        if not key:
            continue

        merged[key] = listing

    return list(merged.values())


def ingest_raw_items(raw_items, source="apify"):
    normalized_items = [
        normalize_listing_record(item, source=source)
        for item in raw_items
    ]
    normalized_items = [
        item
        for item in normalized_items
        if item.get("listingId") or item.get("listingUrl")
    ]
    merged_items = merge_listings(load_normalized_listings(), normalized_items)
    normalized_path = save_normalized_listings(merged_items)

    return {
        "normalizedItems": normalized_items,
        "totalItems": len(merged_items),
        "normalizedPath": normalized_path,
    }
