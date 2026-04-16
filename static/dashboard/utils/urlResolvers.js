const ETSY_SEARCH_URL = "https://www.etsy.com/search";

function buildSearchUrl(query) {
    const searchUrl = new URL(ETSY_SEARCH_URL);
    const normalizedQuery = String(query || "").trim();

    if (normalizedQuery) {
        searchUrl.searchParams.set("q", normalizedQuery);
    }

    return searchUrl.toString();
}

function isTrustedEtsyUrl(rawUrl) {
    if (!rawUrl) {
        return false;
    }

    try {
        const parsedUrl = new URL(rawUrl, window.location.origin);
        const isHttp = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        const isEtsyDomain = /(^|\.)etsy\.com$/i.test(parsedUrl.hostname);

        return isHttp && isEtsyDomain;
    } catch {
        return false;
    }
}

function createSafeLink(rawUrl, fallbackQuery, directLabel, fallbackLabel, isVerified = false) {
    const fallbackHref = buildSearchUrl(fallbackQuery);

    if (isVerified && isTrustedEtsyUrl(rawUrl)) {
        return {
            href: rawUrl,
            fallbackHref,
            isFallback: false,
            actionLabel: directLabel,
            helperLabel: "Exact Etsy URL",
        };
    }

    return {
        href: fallbackHref,
        fallbackHref,
        isFallback: true,
        actionLabel: fallbackLabel,
        helperLabel: "Fallback Etsy search",
    };
}

export function resolveSafeExternalUrl(shopUrl, shopName, isVerified = false) {
    return createSafeLink(shopUrl, shopName, "Visit Shop", "Search Shop", isVerified);
}

export function resolveSafeListingUrl(listingUrl, title, shopName, isVerified = false) {
    return createSafeLink(listingUrl, title || shopName, "View on Etsy", "Search on Etsy", isVerified);
}
