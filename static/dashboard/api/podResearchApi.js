import {
    normalizeListingDetails,
    normalizeTopListingsCollection,
} from "../utils/normalizers.js";

const DEFAULT_CONFIG = {
    baseUrl: window.__POD_RESEARCH_API_BASE_URL__ || "/api/pod-research",
    topListingsPath: "/top-listings",
    listingDetailsPath: (listingId) => `/listings/${encodeURIComponent(listingId)}`,
    keywordInsightsPath: "/keyword-insights",
};

function getApiConfig() {
    return {
        ...DEFAULT_CONFIG,
        ...(window.__POD_RESEARCH_API_CONFIG__ || {}),
    };
}

function buildUrl(path, queryParams = {}) {
    const config = getApiConfig();
    const normalizedBase = config.baseUrl.endsWith("/")
        ? config.baseUrl.slice(0, -1)
        : config.baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || value === "all") {
            return;
        }

        if (typeof value === "boolean") {
            url.searchParams.set(key, value ? "true" : "false");
            return;
        }

        url.searchParams.set(key, String(value));
    });

    return url.toString();
}

async function parseResponseError(response) {
    try {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const payload = await response.json();
            return payload.message || payload.detail || `Request failed with status ${response.status}`;
        }

        const text = await response.text();
        if (contentType.includes("text/html")) {
            if (response.status === 404) {
                return "The POD Research API endpoint was not found. Connect the backend route or use the local Django stub endpoint.";
            }

            return `The POD Research API returned HTML instead of JSON (status ${response.status}).`;
        }

        return text || `Request failed with status ${response.status}`;
    } catch {
        return `Request failed with status ${response.status}`;
    }
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        const message = await parseResponseError(response);
        throw new Error(message);
    }

    return response.json();
}

export async function fetchTopListings(filters, signal) {
    const config = getApiConfig();
    const searchQuery = String(filters.searchQuery || "").trim();
    const url = buildUrl(config.topListingsPath, {
        date: filters.date,
        category: filters.category,
        timeframe: filters.timeframe,
        keyword: filters.searchMode === "shop" ? "" : searchQuery,
        niche: filters.searchMode === "shop" ? "" : searchQuery,
        shopQuery: filters.searchMode === "shop" ? searchQuery : "",
        searchMode: filters.searchMode,
        searchQuery,
        createdTime: filters.createdTime,
        sortBy: filters.sortBy,
        potentialOnly: filters.potentialOnly,
    });
    const payload = await requestJson(url, { signal });

    return normalizeTopListingsCollection(payload);
}

export async function fetchListingDetails(listingId, listingSummary, signal) {
    const config = getApiConfig();
    const url = buildUrl(config.listingDetailsPath(listingId));
    const payload = await requestJson(url, { signal });
    const detailObject = Array.isArray(payload)
        ? payload[0] || {}
        : payload?.item || payload?.listing || (payload?.data && !Array.isArray(payload.data) ? payload.data : payload);

    return normalizeListingDetails(detailObject, listingSummary);
}

export async function fetchKeywordInsights(filters, signal) {
    const config = getApiConfig();
    const url = buildUrl(config.keywordInsightsPath, {
        query: String(filters.query || "").trim(),
        timeframe: filters.timeframe,
        sortBy: filters.sortBy,
    });
    const payload = await requestJson(url, { signal });

    if (Array.isArray(payload)) {
        return { items: payload, meta: {} };
    }

    return {
        items: payload.items || payload.results || payload.data || [],
        meta: payload.meta || {},
    };
}
