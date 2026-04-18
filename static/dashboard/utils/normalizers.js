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

export function thanhSo(value) {
    const giaTriDaPhanTich = Number(value);
    return Number.isFinite(giaTriDaPhanTich) ? parsedValue : 0;
}

export function thanhBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const giaTriDaChuanHoa = value.trim().toLowerCase();
        return giaTriDaChuanHoa === "true" || giaTriDaChuanHoa === "1" || giaTriDaChuanHoa === "yes";
    }

    if (typeof value === "number") {
        return value === 1;
    }

    return false;
}

export function thanhChuoi(value, fallback = "") {
    if (value === undefined || value === null) {
        return fallback;
    }

    return String(value);
}

function layUngVienAnh(image) {
    if (!image || typeof image !== "object") {
        return "";
    }

    return thanhChuoi(
        image.url_fullxfull
        || image.url_570xN
        || image.url_340x270
        || image.url_170x135
        || image.url,
    );
}

export function chonUrlAnh(source, fallbackUrl = "") {
    const cacTapAnh = [
        source?.images,
        source?.listingImages,
        source?.imageResults,
        source?.photos,
    ];

    for (const collection of cacTapAnh) {
        if (!Array.isArray(collection) || !collection.length) {
            continue;
        }

        const candidate = layUngVienAnh(collection[0]);
        if (candidate) {
            return candidate;
        }
    }

    return thanhChuoi(
        source?.thumbnailUrl
        || source?.imageUrl
        || source?.image
        || fallbackUrl,
    );
}

function layNhanThe(rawTag) {
    if (!rawTag) {
        return "";
    }

    if (typeof rawTag === "string") {
        return rawTag.trim();
    }

    return thanhChuoi(rawTag.label || rawTag.name || rawTag.value).trim();
}

export function chuanHoaOThe(rawTags = [], slotCount = 13) {
    const tags = rawTags
        .map((tag, index) => ({
            id: `tag-${index + 1}-${layNhanThe(tag).toLowerCase().replace(/\s+/g, "-")}`,
            label: layNhanThe(tag),
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

function trichCacMucTapHop(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    return payload?.items || payload?.results || payload?.data || payload?.listings || [];
}

export function chuanHoaListingHangDau(rawListing) {
    const listingId = thanhChuoi(rawListing?.listingId || rawListing?.id);

    return {
        listingId,
        listingTitle: thanhChuoi(rawListing?.listingTitle || rawListing?.title),
        listingUrl: thanhChuoi(rawListing?.listingUrl || rawListing?.url),
        listingUrlVerified: thanhBoolean(rawListing?.listingUrlVerified || rawListing?.isListingUrlVerified),
        shopName: thanhChuoi(rawListing?.shopName, "Unknown shop"),
        shopUrl: thanhChuoi(rawListing?.shopUrl),
        shopUrlVerified: thanhBoolean(rawListing?.shopUrlVerified || rawListing?.isShopUrlVerified),
        shopAvatarUrl: thanhChuoi(rawListing?.shopAvatarUrl || rawListing?.avatarUrl || rawListing?.iconUrl),
        createdAt: thanhChuoi(rawListing?.createdAt || rawListing?.createdDate || rawListing?.shopCreatedAt),
        country: thanhChuoi(rawListing?.country || rawListing?.location || rawListing?.shopCountry),
        listingCount: thanhSo(rawListing?.listingCount || rawListing?.listings),
        shopFavorites: thanhSo(rawListing?.shopFavorites || rawListing?.favorites),
        shopReviews: thanhSo(rawListing?.shopReviews || rawListing?.reviews),
        sales1Day: thanhSo(rawListing?.sales1Day || rawListing?.sales_1_day),
        sales7Day: thanhSo(rawListing?.sales7Day || rawListing?.sales_7_day),
        sales30Day: thanhSo(rawListing?.sales30Day || rawListing?.sales_30_day),
        thumbnailUrl: chonUrlAnh(rawListing, rawListing?.shopAvatarUrl || rawListing?.avatarUrl || rawListing?.iconUrl || ""),
        price: thanhSo(rawListing?.price),
        totalShopSales: thanhSo(rawListing?.totalShopSales),
        estimatedSales: thanhSo(rawListing?.estimatedSales),
        views: thanhSo(rawListing?.views),
        favorites: thanhSo(rawListing?.favorites),
        keywords: Array.isArray(rawListing?.keywords) ? rawListing.keywords : [],
        tags: Array.isArray(rawListing?.tags) ? rawListing.tags : [],
        bestSellers: Array.isArray(rawListing?.bestSellers)
            ? rawListing.bestSellers.map((product, index) => ({
                listingId: thanhChuoi(product?.listingId || product?.id || `${listingId}-best-${index + 1}`),
                title: thanhChuoi(product?.title || product?.listingTitle, `Best seller ${index + 1}`),
                listingUrl: thanhChuoi(product?.listingUrl || product?.url),
                listingUrlVerified: thanhBoolean(product?.listingUrlVerified || product?.isListingUrlVerified),
                shopSearchUrlVerified: thanhBoolean(product?.shopSearchUrlVerified),
                imageUrl: chonUrlAnh(product, product?.imageUrl || ""),
                price: thanhSo(product?.price),
                sales: thanhSo(product?.sales || product?.estimatedSales),
                favorites: thanhSo(product?.favorites),
            })).slice(0, 4)
            : [],
    };
}

export function chuanHoaTapListingHangDau(payload) {
    return trichCacMucTapHop(payload)
        .map(chuanHoaListingHangDau)
        .filter((listing) => listing.listingId);
}

export function chuanHoaChiTietListing(rawDetails, listingSummary = null) {
    return {
        listingId: thanhChuoi(rawDetails?.listingId || rawDetails?.id || listingSummary?.listingId),
        title: thanhChuoi(
            rawDetails?.title,
            listingSummary?.listingTitle || `Listing #${listingSummary?.listingId || ""}`.trim(),
        ),
        imageUrl: chonUrlAnh(rawDetails, listingSummary?.thumbnailUrl || ""),
        listingUrl: thanhChuoi(rawDetails?.listingUrl || rawDetails?.url || listingSummary?.listingUrl),
        listingUrlVerified: thanhBoolean(
            rawDetails?.listingUrlVerified
            || rawDetails?.isListingUrlVerified
            || listingSummary?.listingUrlVerified,
        ),
        shopName: thanhChuoi(rawDetails?.shopName || listingSummary?.shopName, "Unknown shop"),
        tags: chuanHoaOThe(rawDetails?.tags || rawDetails?.keywords || []),
    };
}
