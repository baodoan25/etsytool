const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}

export function formatNumber(value) {
    return numberFormatter.format(Number(value || 0));
}

export function formatCompactNumber(value) {
    return compactFormatter.format(Number(value || 0));
}

export function getTimeframeLabel(timeframe) {
    if (String(timeframe) === "1") {
        return "1 day";
    }

    if (String(timeframe) === "7") {
        return "7 days";
    }

    return "30 days";
}

export function buildListingDisplayTitle(listingTitle, listingId) {
    if (String(listingTitle || "").trim()) {
        return listingTitle;
    }

    return `Listing #${listingId}`;
}
