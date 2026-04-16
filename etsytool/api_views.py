from django.http import Http404, JsonResponse
from django.views.decorators.http import require_GET
import re
from urllib.parse import quote

from .dev_keyword_data import get_keyword_insights
from .dev_shop_data import get_listing_fixtures
from .data_engine.storage import load_normalized_listings


SEARCH_ALIASES = {
    "mother": {"mother", "mom", "mama", "mommy"},
    "mom": {"mother", "mom", "mama", "mommy"},
    "father": {"father", "dad", "daddy", "papa"},
    "dad": {"father", "dad", "daddy", "papa"},
    "valentine": {"valentine", "valentines"},
    "christmas": {"christmas", "xmas", "holiday", "ornament"},
    "xmas": {"christmas", "xmas", "holiday", "ornament"},
    "halloween": {"halloween", "spooky", "ghost", "pumpkin", "witch"},
    "spooky": {"halloween", "spooky", "ghost", "pumpkin", "witch"},
    "teacher": {"teacher", "classroom", "school", "educator"},
    "school": {"teacher", "classroom", "school", "student", "back"},
    "graduation": {"graduation", "graduate", "grad", "class"},
    "graduate": {"graduation", "graduate", "grad", "class"},
    "jewelry": {"jewelry", "necklace", "ring", "earring", "bracelet"},
    "necklace": {"jewelry", "necklace", "personalized", "gift"},
    "garden": {"garden", "seed", "plant", "botanical", "flower", "herb"},
    "seed": {"garden", "seed", "plant", "botanical", "flower", "herb"},
    "svg": {"svg", "png", "digital", "printable", "clipart", "sublimation"},
    "png": {"svg", "png", "digital", "printable", "clipart", "sublimation"},
    "digital": {"svg", "png", "digital", "printable", "clipart", "download"},
    "patch": {"patch", "embroidery", "badge", "applique"},
    "fabric": {"fabric", "sewing", "quilt", "cotton", "pattern"},
    "therapy": {"therapy", "mental", "wellness", "self", "care", "worksheet"},
    "gift": {"gift", "present", "personalized", "custom"},
}


def _normalize_search_token(token):
    token = token.strip().lower()

    if len(token) > 4 and token.endswith("s"):
        token = token[:-1]

    return token


def _search_tokens(value):
    normalized = re.sub(r"[^a-z0-9]+", " ", str(value or "").lower())
    return [_normalize_search_token(token) for token in normalized.split() if token]


def _expand_search_tokens(tokens):
    expanded = set(tokens)

    for token in tokens:
        expanded.update(SEARCH_ALIASES.get(token, set()))

    return expanded


def _matches_search_text(query, candidates):
    query_tokens = _search_tokens(query)

    if not query_tokens:
        return True

    expanded_query_tokens = _expand_search_tokens(query_tokens)
    candidate_text = " ".join(str(candidate or "") for candidate in candidates)
    candidate_tokens = set(_search_tokens(candidate_text))
    expanded_candidate_tokens = _expand_search_tokens(candidate_tokens)

    meaningful_query_tokens = [
        token
        for token in query_tokens
        if token not in {"day", "for", "the", "and", "to", "of"}
    ]
    tokens_to_match = meaningful_query_tokens or query_tokens

    return all(
        token in expanded_candidate_tokens
        or bool(SEARCH_ALIASES.get(token, set()) & expanded_candidate_tokens)
        for token in tokens_to_match
    )


def _listing_sales_value(listing, timeframe):
    if "estimatedSalesMap" in listing:
        return listing["estimatedSalesMap"].get(timeframe, listing["estimatedSalesMap"].get("7", 0))

    return listing.get(f"sales{timeframe}Day", listing.get("sales30Day", listing.get("sales7Day", 0)))


def _shop_product_search_url(listing):
    return f'{listing["shopUrl"]}?search_query={quote(listing["listingTitle"])}'


def _serialize_best_seller_product(listing, timeframe):
    has_verified_listing_url = listing.get("listingUrlVerified", False)

    return {
        "listingId": listing["listingId"],
        "title": listing["listingTitle"],
        "listingUrl": listing["listingUrl"] if has_verified_listing_url else _shop_product_search_url(listing),
        "listingUrlVerified": has_verified_listing_url,
        "shopSearchUrlVerified": not has_verified_listing_url and listing.get("shopUrlVerified", False),
        "imageUrl": listing.get("thumbnailUrl", listing.get("shopAvatarUrl", "")),
        "price": listing.get("price", 0),
        "sales": _listing_sales_value(listing, timeframe),
        "favorites": listing.get("favorites", listing.get("shopFavorites", 0)),
    }


def _get_shop_best_sellers(listing, timeframe, source_listings):
    shop_name = listing["shopName"]
    shop_listings = [
        product
        for product in source_listings
        if product.get("shopName") == shop_name
    ]
    ordered_products = sorted(
        shop_listings,
        key=lambda product: _listing_sales_value(product, timeframe),
        reverse=True,
    )

    return [_serialize_best_seller_product(product, timeframe) for product in ordered_products[:4]]


def _get_listing_source():
    fixtures = get_listing_fixtures()
    ingested_listings = load_normalized_listings()
    merged = {}

    for listing in [*fixtures, *ingested_listings]:
        listing_id = str(listing.get("listingId") or "").strip()
        listing_url = str(listing.get("listingUrl") or "").strip()
        key = listing_id or listing_url

        if not key:
            continue

        merged[key] = listing

    return list(merged.values())


def _matches_query(listing, search_mode, search_query):
    if not search_query:
        return True

    if search_mode == "shop":
        query = search_query.strip().lower()
        candidates = [listing["shopName"], listing["shopUrl"], listing["listingId"]]
        return any(query in str(candidate).lower() for candidate in candidates)
    elif search_mode == "tag":
        candidates = listing.get("tags", [])
    else:
        candidates = [
            listing["listingTitle"],
            listing["shopName"],
            listing.get("category", ""),
            *listing.get("keywords", []),
            *listing.get("tags", []),
            *listing.get("searchIntents", []),
        ]

    return _matches_search_text(search_query, candidates)


def _matches_created_time(listing, created_time):
    if created_time in ("", "all", None):
        return True

    try:
        return listing.get("createdDaysAgo", 9999) < int(created_time)
    except (TypeError, ValueError):
        return True


def _matches_category(listing, category):
    return category in ("", "all", None) or listing["category"] == category


def _matches_potential(listing, timeframe, potential_only):
    if not potential_only:
        return True

    estimated_sales = listing.get(f"sales{timeframe}Day", listing.get("estimatedSalesMap", {}).get(timeframe, 0))
    created_days_ago = listing.get("createdDaysAgo")
    is_recent_or_unverified = created_days_ago is None or created_days_ago <= 30
    return is_recent_or_unverified and (estimated_sales >= 50 or listing.get("goodReviews", 0) >= 10)


def _serialize_listing(listing, timeframe, source_listings=None):
    source_listings = source_listings or [listing]
    estimated_sales = _listing_sales_value(listing, timeframe)
    serialized = {
        "listingId": listing["listingId"],
        "listingTitle": listing["listingTitle"],
        "listingUrl": listing["listingUrl"],
        "listingUrlVerified": listing.get("listingUrlVerified", False),
        "shopName": listing["shopName"],
        "shopUrl": listing["shopUrl"],
        "shopUrlVerified": listing.get("shopUrlVerified", False),
        "shopAvatarUrl": listing.get("shopAvatarUrl", listing.get("thumbnailUrl", "")),
        "thumbnailUrl": listing.get("shopAvatarUrl", listing.get("thumbnailUrl", "")),
        "createdAt": listing.get("createdAt", ""),
        "country": listing.get("country", ""),
        "listingCount": listing.get("listingCount", 0),
        "shopFavorites": listing.get("shopFavorites", listing.get("favorites", 0)),
        "shopReviews": listing.get("shopReviews", 0),
        "sales1Day": listing.get("sales1Day", listing.get("estimatedSalesMap", {}).get("1", 0)),
        "sales7Day": listing.get("sales7Day", listing.get("estimatedSalesMap", {}).get("7", 0)),
        "sales30Day": listing.get("sales30Day", listing.get("estimatedSalesMap", {}).get("30", 0)),
        "price": listing["price"],
        "totalShopSales": listing["totalShopSales"],
        "estimatedSales": estimated_sales,
        "views": listing["views"],
        "favorites": listing.get("shopFavorites", listing.get("favorites", 0)),
        "keywords": listing.get("keywords", []),
        "tags": listing.get("tags", []),
        "bestSellers": _get_shop_best_sellers(listing, timeframe, source_listings),
    }
    return serialized


def _sort_listings(listings, sort_by, timeframe):
    if sort_by == "best-selling":
        return sorted(
            listings,
            key=lambda listing: listing.get(f"sales{timeframe}Day", listing.get("estimatedSalesMap", {}).get(timeframe, 0)),
            reverse=True,
        )

    if sort_by == "most-viewed":
        return sorted(listings, key=lambda listing: listing["views"], reverse=True)

    return sorted(listings, key=lambda listing: listing.get("createdDaysAgo", 9999))


@require_GET
def top_listings_view(request):
    timeframe = request.GET.get("timeframe", "7")
    search_mode = request.GET.get("searchMode", "keyword")
    search_query = (
        request.GET.get("searchQuery")
        or request.GET.get("keyword")
        or request.GET.get("niche")
        or request.GET.get("shopQuery")
        or ""
    )
    category = request.GET.get("category", "all")
    created_time = request.GET.get("createdTime", "all")
    sort_by = request.GET.get("sortBy", "best-selling")
    potential_only = request.GET.get("potentialOnly", "false").lower() == "true"

    listings = _get_listing_source()
    filtered = [
        listing
        for listing in listings
        if _matches_category(listing, category)
        and _matches_created_time(listing, created_time)
        and _matches_query(listing, search_mode, search_query)
        and _matches_potential(listing, timeframe, potential_only)
    ]
    ordered = _sort_listings(filtered, sort_by, timeframe)

    return JsonResponse(
        {
            "items": [_serialize_listing(listing, timeframe, listings) for listing in ordered],
            "meta": {
                "timeframe": timeframe,
                "category": category,
                "searchMode": search_mode,
                "searchQuery": search_query,
                "count": len(ordered),
            },
        }
    )


@require_GET
def listing_details_view(request, listing_id):
    listing = next((item for item in _get_listing_source() if item["listingId"] == str(listing_id)), None)

    if not listing:
        raise Http404("Listing not found")

    return JsonResponse(
        {
            "listingId": listing["listingId"],
            "title": listing["listingTitle"],
            "listingUrl": listing["listingUrl"],
            "listingUrlVerified": listing.get("listingUrlVerified", False),
            "imageUrl": listing.get("shopAvatarUrl", listing.get("thumbnailUrl", "")),
            "shopAvatarUrl": listing.get("shopAvatarUrl", listing.get("thumbnailUrl", "")),
            "shopName": listing["shopName"],
            "tags": listing["tags"][:13],
        }
    )


@require_GET
def keyword_insights_view(request):
    query = request.GET.get("query", "").strip().lower()
    sort_by = request.GET.get("sortBy", "sales")
    timeframe = request.GET.get("timeframe", "1")
    items = get_keyword_insights()

    if query:
        items = [
            item
            for item in items
            if _matches_search_text(
                query,
                [
                    item.get("keyword", ""),
                    *item.get("intentTags", []),
                ],
            )
        ]

    if sort_by == "score":
        items = sorted(items, key=lambda item: item["score"], reverse=True)
    elif sort_by == "new-listings":
        items = sorted(items, key=lambda item: item["newListings"], reverse=True)
    elif sort_by == "total-listings":
        items = sorted(items, key=lambda item: item["totalListings"], reverse=True)
    else:
        items = sorted(items, key=lambda item: item["sales"], reverse=True)

    return JsonResponse(
        {
            "items": items,
            "meta": {
                "query": query,
                "sortBy": sort_by,
                "timeframe": timeframe,
                "count": len(items),
                "market": "USA",
            },
        }
    )
