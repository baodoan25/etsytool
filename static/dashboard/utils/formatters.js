const boDinhDangTienTe = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

const boDinhDangSo = new Intl.NumberFormat("en-US");

const boDinhDangGon = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function dinhDangTienTe(value) {
    return boDinhDangTienTe.format(Number(value || 0));
}

export function dinhDangSo(value) {
    return boDinhDangSo.format(Number(value || 0));
}

export function dinhDangSoGon(value) {
    return boDinhDangGon.format(Number(value || 0));
}

export function layNhanKhoangThoiGian(timeframe) {
    if (String(timeframe) === "1") {
        return "1 day";
    }

    if (String(timeframe) === "7") {
        return "7 days";
    }

    return "30 days";
}

export function taoTieuDeHienThiListing(listingTitle, listingId) {
    if (String(listingTitle || "").trim()) {
        return listingTitle;
    }

    return `Listing #${listingId}`;
}
