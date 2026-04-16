/**
 * @typedef {Object} TopListing
 * @property {string} listingId
 * @property {string} listingTitle
 * @property {string} listingUrl
 * @property {boolean} listingUrlVerified
 * @property {string} shopName
 * @property {string} shopUrl
 * @property {boolean} shopUrlVerified
 * @property {string} shopAvatarUrl
 * @property {string} createdAt
 * @property {string} country
 * @property {number} listingCount
 * @property {number} shopFavorites
 * @property {number} shopReviews
 * @property {number} sales1Day
 * @property {number} sales7Day
 * @property {number} sales30Day
 * @property {string} thumbnailUrl
 * @property {number} price
 * @property {number} totalShopSales
 * @property {number} estimatedSales
 * @property {number} views
 * @property {number} favorites
 * @property {Array} bestSellers
 */

/**
 * @typedef {Object} ListingTagSlot
 * @property {string} id
 * @property {string} label
 * @property {boolean} isPlaceholder
 */

/**
 * @typedef {Object} ListingDetails
 * @property {string} listingId
 * @property {string} title
 * @property {string} imageUrl
 * @property {string} listingUrl
 * @property {boolean} listingUrlVerified
 * @property {string} shopName
 * @property {ListingTagSlot[]} tags
 */

export function asNumber(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function asBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalizedValue = value.trim().toLowerCase();
        return normalizedValue === "true" || normalizedValue === "1" || normalizedValue === "yes";
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return false;
}

export function asString(value, fallback = "") {
    if (value === undefined || value === null) {
        return fallback;
    }

    return String(value);
}

function getImageCandidate(image) {
    if (!image || typeof image !== "object") {
        return "";
    }

    return asString(
        image.url_fullxfull
        || image.url_570xN
        || image.url_340x270
        || image.url_170x135
        || image.url,
    );
}

export function pickImageUrl(source, fallbackUrl = "") {
    const imageCollections = [
        source?.images,
        source?.listingImages,
        source?.imageResults,
        source?.photos,
    ];

    for (const collection of imageCollections) {
        if (!Array.isArray(collection) || !collection.length) {
            continue;
        }

        const candidate = getImageCandidate(collection[0]);
        if (candidate) {
            return candidate;
        }
    }

    return asString(
        source?.thumbnailUrl
        || source?.imageUrl
        || source?.image
        || fallbackUrl,
    );
}

function getTagLabel(rawTag) {
    if (!rawTag) {
        return "";
    }

    if (typeof rawTag === "string") {
        return rawTag.trim();
    }

    return asString(rawTag.label || rawTag.name || rawTag.value).trim();
}

export function normalizeTagSlots(rawTags = [], slotCount = 13) {
    const tags = rawTags
        .map((tag, index) => ({
            id: `tag-${index + 1}-${getTagLabel(tag).toLowerCase().replace(/\s+/g, "-")}`,
            label: getTagLabel(tag),
            isPlaceholder: false,
        }))
        .filter((tag) => tag.label)
        .slice(0, slotCount);

    while (tags.length < slotCount) {
        tags.push({
            id: `placeholder-${tags.length + 1}`,
            label: `Tag slot ${tags.length + 1}`,
            isPlaceholder: true,
        });
    }

    return tags;
}

function extractCollectionItems(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    return payload?.items || payload?.results || payload?.data || payload?.listings || [];
}

export function normalizeTopListing(rawListing) {
    const listingId = asString(rawListing?.listingId || rawListing?.id);

    return {
        listingId,
        listingTitle: asString(rawListing?.listingTitle || rawListing?.title),
        listingUrl: asString(rawListing?.listingUrl || rawListing?.url),
        listingUrlVerified: asBoolean(rawListing?.listingUrlVerified || rawListing?.isListingUrlVerified),
        shopName: asString(rawListing?.shopName, "Unknown shop"),
        shopUrl: asString(rawListing?.shopUrl),
        shopUrlVerified: asBoolean(rawListing?.shopUrlVerified || rawListing?.isShopUrlVerified),
        shopAvatarUrl: asString(rawListing?.shopAvatarUrl || rawListing?.avatarUrl || rawListing?.iconUrl),
        createdAt: asString(rawListing?.createdAt || rawListing?.createdDate || rawListing?.shopCreatedAt),
        country: asString(rawListing?.country || rawListing?.location || rawListing?.shopCountry),
        listingCount: asNumber(rawListing?.listingCount || rawListing?.listings),
        shopFavorites: asNumber(rawListing?.shopFavorites || rawListing?.favorites),
        shopReviews: asNumber(rawListing?.shopReviews || rawListing?.reviews),
        sales1Day: asNumber(rawListing?.sales1Day || rawListing?.sales_1_day),
        sales7Day: asNumber(rawListing?.sales7Day || rawListing?.sales_7_day),
        sales30Day: asNumber(rawListing?.sales30Day || rawListing?.sales_30_day),
        thumbnailUrl: pickImageUrl(rawListing, rawListing?.shopAvatarUrl || rawListing?.avatarUrl || rawListing?.iconUrl || ""),
        price: asNumber(rawListing?.price),
        totalShopSales: asNumber(rawListing?.totalShopSales),
        estimatedSales: asNumber(rawListing?.estimatedSales),
        views: asNumber(rawListing?.views),
        favorites: asNumber(rawListing?.favorites),
        keywords: Array.isArray(rawListing?.keywords) ? rawListing.keywords : [],
        tags: Array.isArray(rawListing?.tags) ? rawListing.tags : [],
        bestSellers: Array.isArray(rawListing?.bestSellers)
            ? rawListing.bestSellers.map((product, index) => ({
                listingId: asString(product?.listingId || product?.id || `${listingId}-best-${index + 1}`),
                title: asString(product?.title || product?.listingTitle, `Best seller ${index + 1}`),
                listingUrl: asString(product?.listingUrl || product?.url),
                listingUrlVerified: asBoolean(product?.listingUrlVerified || product?.isListingUrlVerified),
                shopSearchUrlVerified: asBoolean(product?.shopSearchUrlVerified),
                imageUrl: pickImageUrl(product, product?.imageUrl || ""),
                price: asNumber(product?.price),
                sales: asNumber(product?.sales || product?.estimatedSales),
                favorites: asNumber(product?.favorites),
            })).slice(0, 4)
            : [],
    };
}

export function normalizeTopListingsCollection(payload) {
    return extractCollectionItems(payload)
        .map(normalizeTopListing)
        .filter((listing) => listing.listingId);
}

export function normalizeListingDetails(rawDetails, listingSummary = null) {
    return {
        listingId: asString(rawDetails?.listingId || rawDetails?.id || listingSummary?.listingId),
        title: asString(
            rawDetails?.title,
            listingSummary?.listingTitle || `Listing #${listingSummary?.listingId || ""}`.trim(),
        ),
        imageUrl: pickImageUrl(rawDetails, listingSummary?.thumbnailUrl || ""),
        listingUrl: asString(rawDetails?.listingUrl || rawDetails?.url || listingSummary?.listingUrl),
        listingUrlVerified: asBoolean(
            rawDetails?.listingUrlVerified
            || rawDetails?.isListingUrlVerified
            || listingSummary?.listingUrlVerified,
        ),
        shopName: asString(rawDetails?.shopName || listingSummary?.shopName, "Unknown shop"),
        tags: normalizeTagSlots(rawDetails?.tags || rawDetails?.keywords || []),
    };
}
