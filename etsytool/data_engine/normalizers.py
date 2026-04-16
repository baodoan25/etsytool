import re
from datetime import datetime, timezone
from urllib.parse import urlparse


def as_string(value, fallback=""):
    if value is None:
        return fallback

    return str(value)


def as_number(value, fallback=0):
    if value is None:
        return fallback

    if isinstance(value, (int, float)):
        return value

    cleaned = re.sub(r"[^0-9.\-]", "", str(value))

    if not cleaned:
        return fallback

    try:
        parsed = float(cleaned)
    except ValueError:
        return fallback

    return int(parsed) if parsed.is_integer() else parsed


def as_boolean(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y"}

    return bool(value)


def first_value(source, *keys, fallback=""):
    for key in keys:
        value = source.get(key)

        if value not in (None, ""):
            return value

    return fallback


def pick_image_url(source):
    direct_image = first_value(
        source,
        "thumbnailUrl",
        "imageUrl",
        "image",
        "mainImage",
        "primaryImage",
        "img",
    )

    if direct_image:
        return as_string(direct_image)

    for key in ("images", "listingImages", "photos", "imageUrls"):
        images = source.get(key)

        if not isinstance(images, list) or not images:
            continue

        first_image = images[0]

        if isinstance(first_image, str):
            return first_image

        if isinstance(first_image, dict):
            image_url = first_value(
                first_image,
                "url_fullxfull",
                "url_570xN",
                "url_340x270",
                "url_170x135",
                "url",
            )

            if image_url:
                return as_string(image_url)

    return ""


def extract_listing_id(raw_listing):
    listing_id = first_value(raw_listing, "listingId", "listing_id", "id")

    if listing_id:
        return as_string(listing_id)

    listing_url = as_string(first_value(raw_listing, "listingUrl", "url", "link"))
    match = re.search(r"/listing/(\d+)", listing_url)

    return match.group(1) if match else ""


def is_trusted_etsy_url(raw_url):
    if not raw_url:
        return False

    parsed_url = urlparse(str(raw_url))
    hostname = parsed_url.hostname or ""

    return parsed_url.scheme in {"http", "https"} and (hostname == "etsy.com" or hostname.endswith(".etsy.com"))


def normalize_tag_list(value):
    if not value:
        return []

    if isinstance(value, str):
        return [tag.strip() for tag in re.split(r"[,|;]", value) if tag.strip()]

    if isinstance(value, list):
        tags = []

        for item in value:
            if isinstance(item, str):
                tags.append(item.strip())
            elif isinstance(item, dict):
                label = first_value(item, "label", "name", "tag", "value")

                if label:
                    tags.append(as_string(label).strip())

        return [tag for tag in tags if tag]

    return []


def normalize_listing_record(raw_listing, source="apify"):
    listing_url = as_string(first_value(raw_listing, "listingUrl", "url", "link", "productUrl"))
    shop_url = as_string(first_value(raw_listing, "shopUrl", "sellerUrl", "storeUrl"))
    shop_name = as_string(first_value(raw_listing, "shopName", "sellerName", "storeName", "shop"))
    title = as_string(first_value(raw_listing, "listingTitle", "title", "name"))
    tags = normalize_tag_list(first_value(raw_listing, "tags", "tagList", "listingTags", fallback=[]))
    keywords = normalize_tag_list(first_value(raw_listing, "keywords", "keyword", "searchTerms", fallback=[]))
    price = as_number(first_value(raw_listing, "price", "salePrice", "amount", fallback=0))
    favorites = as_number(first_value(raw_listing, "favorites", "favoriteCount", "likes", fallback=0))
    reviews = as_number(first_value(raw_listing, "reviews", "reviewCount", "shopReviews", fallback=0))
    views = as_number(first_value(raw_listing, "views", "viewCount", fallback=0))
    rating = as_number(first_value(raw_listing, "rating", "stars", fallback=0))
    sales = as_number(first_value(raw_listing, "sales", "estimatedSales", "sales30Day", fallback=0))
    listing_id = extract_listing_id(raw_listing)
    scraped_at = datetime.now(timezone.utc).isoformat()

    return {
        "listingId": listing_id,
        "listingTitle": title or f"Etsy Listing {listing_id}".strip(),
        "listingUrl": listing_url,
        "listingUrlVerified": is_trusted_etsy_url(listing_url) and "/listing/" in listing_url,
        "shopName": shop_name or "Unknown shop",
        "shopUrl": shop_url,
        "shopUrlVerified": is_trusted_etsy_url(shop_url) and "/shop/" in shop_url,
        "shopAvatarUrl": as_string(first_value(raw_listing, "shopAvatarUrl", "sellerAvatar", "shopIcon")),
        "thumbnailUrl": pick_image_url(raw_listing),
        "createdAt": as_string(first_value(raw_listing, "createdAt", "dateCreated", "publishedAt")),
        "country": as_string(first_value(raw_listing, "country", "location", "shopCountry")),
        "category": as_string(first_value(raw_listing, "category", "categoryName", fallback="all")),
        "listingCount": as_number(first_value(raw_listing, "listingCount", "shopListingCount", fallback=0)),
        "shopFavorites": as_number(first_value(raw_listing, "shopFavorites", "sellerFavorites", fallback=favorites)),
        "shopReviews": reviews,
        "sales1Day": 0,
        "sales7Day": 0,
        "sales30Day": sales,
        "price": price,
        "totalShopSales": as_number(first_value(raw_listing, "totalShopSales", "shopSales", fallback=sales)),
        "views": views,
        "favorites": favorites,
        "keywords": keywords,
        "tags": tags,
        "searchIntents": [*keywords, *tags, title, shop_name],
        "source": source,
        "scrapedAt": scraped_at,
    }
