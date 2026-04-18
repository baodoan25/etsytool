import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    Eye,
    Heart,
    LineChart as LineChartIcon,
    MessageSquare,
    Package,
    ShoppingBag,
    Store,
    TrendingUp,
    X,
} from "lucide-react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { TrangThaiDuPhong } from "./FallbackState.js";
import { LuoiKhungTai } from "./GridSkeleton.js";
import { dinhDangSoGon, dinhDangTienTe, dinhDangSo } from "../utils/formatters.js";
import { html } from "../utils/html.js";
import { resolveSafeExternalUrl, resolveSafeListingUrl } from "../utils/urlResolvers.js";

const cacChiSoShop = [
    { key: "listingCount", label: "Listings", icon: Package },
    { key: "shopFavorites", label: "Favorites", icon: Heart },
    { key: "shopReviews", label: "Reviews", icon: MessageSquare },
];

const cacChiSoDoanhSo = [
    { key: "sales1Day", label: "1 Day" },
    { key: "sales7Day", label: "7 Days" },
    { key: "sales30Day", label: "30 Days" },
];

function taoAnhSanPham(title, accentColor) {
    const safeTitle = title
        .slice(0, 34)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const svg = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="320" viewBox="0 0 420 320">',
        '<rect width="420" height="320" rx="28" fill="#fff8f1"/>',
        `<rect x="34" y="34" width="352" height="252" rx="24" fill="${accentColor}"/>`,
        '<circle cx="330" cy="82" r="54" fill="rgba(255,255,255,0.22)"/>',
        '<rect x="70" y="190" width="210" height="22" rx="11" fill="rgba(255,255,255,0.78)"/>',
        '<rect x="70" y="226" width="150" height="18" rx="9" fill="rgba(255,255,255,0.58)"/>',
        `<text x="70" y="138" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="white">${safeTitle}</text>`,
        '</svg>',
    ].join("");

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function taoLichSuXepHang(shop) {
    const viewsBase = Math.max(shop.views || 1, 1);
    const salesBase = Math.max(shop.sales30Day || shop.estimatedSales || 1, 1);
    const favoriteBase = Math.max(shop.shopFavorites || shop.favorites || 1, 1);
    const points = [
        { label: "W-5", views: 0.58, sales: 0.46, favorites: 0.62 },
        { label: "W-4", views: 0.64, sales: 0.52, favorites: 0.66 },
        { label: "W-3", views: 0.71, sales: 0.61, favorites: 0.72 },
        { label: "W-2", views: 0.79, sales: 0.73, favorites: 0.80 },
        { label: "W-1", views: 0.90, sales: 0.86, favorites: 0.90 },
        { label: "Now", views: 1, sales: 1, favorites: 1 },
    ];

    return points.map((point) => ({
        period: point.label,
        views: Math.round(viewsBase * point.views),
        sales: Math.round(salesBase * point.sales),
        favorites: Math.round(favoriteBase * point.favorites),
    }));
}

function taoSanPhamBanChay(shop) {
    if (Array.isArray(shop.bestSellers) && shop.bestSellers.length) {
        return shop.bestSellers
            .map((product, index) => ({
                id: product.listingId || `${shop.listingId}-best-${index + 1}`,
                title: product.title || `Best seller ${index + 1}`,
                imageUrl: product.imageUrl || taoAnhSanPham(product.title || `Best seller ${index + 1}`, "#f58220"),
                url: product.listingUrl,
                urlVerified: product.listingUrlVerified,
                shopSearchUrlVerified: product.shopSearchUrlVerified,
                price: product.price || 0,
                estimatedSales: product.sales || 0,
                favorites: product.favorites || 0,
            }))
            .sort((first, second) => second.estimatedSales - first.estimatedSales)
            .slice(0, 4);
    }

    return [];
}

function TheDoiThu({ listing, timeframe, onSelect }) {
    const shopLink = resolveSafeExternalUrl(listing.shopUrl, listing.shopName, listing.shopUrlVerified);

    return html`
        <article
            className="group relative cursor-pointer overflow-hidden rounded-[10px] border border-border bg-white shadow-panel transition duration-200 hover:-translate-y-1 hover:shadow-float"
            onClick=${() => onSelect(listing)}
            onKeyDown=${(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(listing);
                }
            }}
            role="button"
            tabIndex=${0}
        >
            <div className="p-5">
                <div className="flex items-start gap-3">
                    <img
                        src=${listing.shopAvatarUrl || listing.thumbnailUrl}
                        alt=${`${listing.shopName} avatar`}
                        className="h-12 w-12 shrink-0 rounded-xl border border-border object-cover shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-ink">${listing.shopName}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                            <span className="inline-flex items-center gap-1">
                                <${CalendarDays} className="h-3.5 w-3.5" />
                                ${listing.createdAt || "Tracked shop"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-blue-600">
                                <${BarChart3} className="h-3.5 w-3.5" />
                                ${dinhDangSoGon(listing.totalShopSales)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="my-5 border-t border-border"></div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    ${cacChiSoShop.map((metric) => {
                        const Icon = metric.icon;

                        return html`
                            <div key=${metric.key}>
                                <div className="mx-auto mb-1 flex items-center justify-center gap-1 text-xl font-semibold text-ink">
                                    <${Icon} className="h-4 w-4 text-muted" />
                                    ${dinhDangSoGon(listing[metric.key])}
                                </div>
                                <div className="text-sm text-muted">${metric.label}</div>
                            </div>
                        `;
                    })}
                </div>

                <div className="my-5 border-t border-border"></div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    ${cacChiSoDoanhSo.map((metric) => html`
                        <div key=${metric.key}>
                            <div className="text-xl font-semibold text-sunrise">${dinhDangSoGon(listing[metric.key])}</div>
                            <div className="mt-1 text-sm text-muted">${metric.label}</div>
                        </div>
                    `)}
                </div>

                <p className="mt-1 text-center text-sm text-muted">Sales</p>

                <div className="my-5 border-t border-border"></div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick=${(event) => {
                            event.stopPropagation();
                            onSelect(listing);
                        }}
                        className="h-10 rounded-lg border border-border bg-white text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                        Track rank
                    </button>
                    <a
                        href=${shopLink.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick=${(event) => event.stopPropagation()}
                        title=${shopLink.helperLabel}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                        ${shopLink.isFallback ? "Search shop" : "View shop"}
                        <${ArrowUpRight} className="h-4 w-4" />
                    </a>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                        <${LineChartIcon} className="h-3.5 w-3.5" />
                        Click for views, sales, favorites rank
                    </span>
                    <span className="font-semibold text-sunrise">
                        ${dinhDangSo(listing.estimatedSales)} selected-period sales
                    </span>
                </div>
            </div>
        </article>
    `;
}

function TheSanPhamBanChay({ product, shop }) {
    const isDirectListing = product.url?.includes("/listing/") && product.urlVerified;
    const productLink = isDirectListing
        ? resolveSafeListingUrl(product.url, product.title, shop.shopName, product.urlVerified)
        : resolveSafeExternalUrl(product.url, shop.shopName, product.shopSearchUrlVerified);

    return html`
        <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <a href=${productLink.href} target="_blank" rel="noreferrer" title=${productLink.helperLabel}>
                <img
                    src=${product.imageUrl}
                    alt=${product.title}
                    className="h-40 w-full object-cover"
                />
            </a>
            <div className="p-4">
                <h4 className="line-clamp-2 min-h-[44px] text-sm font-semibold leading-5 text-ink">${product.title}</h4>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-canvas px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Price</p>
                        <p className="mt-1 text-sm font-semibold text-ink">${dinhDangTienTe(product.price)}</p>
                    </div>
                    <div className="rounded-xl bg-canvas px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Product sales</p>
                        <p className="mt-1 text-sm font-semibold text-sunrise">${dinhDangSoGon(product.estimatedSales)}</p>
                    </div>
                    <div className="rounded-xl bg-canvas px-2 py-2">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Fav</p>
                        <p className="mt-1 text-sm font-semibold text-ink">${dinhDangSoGon(product.favorites)}</p>
                    </div>
                </div>
                <a
                    href=${productLink.href}
                    target="_blank"
                    rel="noreferrer"
                    title=${productLink.helperLabel}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                    ${isDirectListing ? "Open listing" : "Find in shop"}
                    <${ArrowUpRight} className="h-4 w-4" />
                </a>
            </div>
        </article>
    `;
}

function HopThoaiDoiThu({ shop, onClose }) {
    const rankHistory = useMemo(() => (shop ? taoLichSuXepHang(shop) : []), [shop]);
    const bestSellers = useMemo(() => (shop ? taoSanPhamBanChay(shop) : []), [shop]);
    const shopLink = shop ? resolveSafeExternalUrl(shop.shopUrl, shop.shopName, shop.shopUrlVerified) : null;

    useEffect(() => {
        if (!shop) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [shop, onClose]);

    if (!shop) {
        return null;
    }

    return html`
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-10 py-10 backdrop-blur-sm"
            onClick=${onClose}
        >
            <div
                className="surface-panel app-scrollbar relative h-[calc(100vh-80px)] w-[min(1220px,calc(100vw-120px))] overflow-y-auto rounded-[30px] p-8"
                onClick=${(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="competitor-modal-title"
            >
                <button
                    type="button"
                    onClick=${onClose}
                    className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-muted transition hover:text-ink"
                    aria-label="Close modal"
                >
                    <${X} className="h-5 w-5" />
                </button>

                <section className="mb-6 grid gap-6 pr-14 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <div className="rounded-[24px] border border-border bg-white p-5">
                        <img
                            src=${shop.shopAvatarUrl || shop.thumbnailUrl}
                            alt=${`${shop.shopName} avatar`}
                            className="h-24 w-24 rounded-2xl border border-border object-cover shadow-sm"
                        />
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sunrise">Competitor profile</p>
                        <h2 id="competitor-modal-title" className="mt-2 font-display text-[2rem] leading-tight text-ink">${shop.shopName}</h2>
                        <p className="mt-3 text-sm leading-6 text-muted">
                            Rank movement is modeled from tracked views, selected-period sales, and favorite velocity for this shop.
                        </p>
                        <a
                            href=${shopLink.href}
                            target="_blank"
                            rel="noreferrer"
                            title=${shopLink.helperLabel}
                            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-sunrise"
                        >
                            ${shopLink.isFallback ? "Search shop on Etsy" : "Open Etsy shop"}
                            <${ArrowUpRight} className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="rounded-[24px] border border-border bg-white p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Rank trend</p>
                                <h3 className="mt-1 font-display text-2xl text-ink">Views, sales, favorites</h3>
                            </div>
                            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                                6-week movement
                            </span>
                        </div>
                        <div className="h-[320px]">
                            <${ResponsiveContainer} width="100%" height="100%">
                                <${LineChart} data=${rankHistory} margin=${{ top: 8, right: 20, left: 0, bottom: 0 }}>
                                    <${CartesianGrid} strokeDasharray="3 3" stroke="#efdac7" />
                                    <${XAxis} dataKey="period" tick=${{ fill: "#8e6d55", fontSize: 12 }} axisLine=${false} tickLine=${false} />
                                    <${YAxis} tickFormatter=${dinhDangSoGon} tick=${{ fill: "#8e6d55", fontSize: 12 }} axisLine=${false} tickLine=${false} width=${58} />
                                    <${Tooltip} formatter=${(value) => dinhDangSo(value)} contentStyle=${{ borderRadius: 12, border: "1px solid #efdac7" }} />
                                    <${Legend} />
                                    <${Line} type="monotone" dataKey="views" name="Views" stroke="#2563eb" strokeWidth=${3} dot=${false} />
                                    <${Line} type="monotone" dataKey="sales" name="Sales" stroke="#f58220" strokeWidth=${3} dot=${false} />
                                    <${Line} type="monotone" dataKey="favorites" name="Favorites" stroke="#0f9f6e" strokeWidth=${3} dot=${false} />
                                <//>
                            <//>
                        </div>
                    </div>
                </section>

                <section className="mb-5 grid grid-cols-4 gap-4">
                    <div className="rounded-[22px] border border-border bg-white px-4 py-3">
                        <p className="stat-label flex items-center gap-2 text-[10px] text-muted"><${Eye} className="h-3.5 w-3.5" />Views</p>
                        <p className="mt-2 font-display text-2xl text-ink">${dinhDangSoGon(shop.views)}</p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white px-4 py-3">
                        <p className="stat-label flex items-center gap-2 text-[10px] text-muted"><${BarChart3} className="h-3.5 w-3.5" />Sales 30d</p>
                        <p className="mt-2 font-display text-2xl text-sunrise">${dinhDangSoGon(shop.sales30Day)}</p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white px-4 py-3">
                        <p className="stat-label flex items-center gap-2 text-[10px] text-muted"><${Heart} className="h-3.5 w-3.5" />Favorites</p>
                        <p className="mt-2 font-display text-2xl text-ink">${dinhDangSoGon(shop.shopFavorites)}</p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white px-4 py-3">
                        <p className="stat-label flex items-center gap-2 text-[10px] text-muted"><${ShoppingBag} className="h-3.5 w-3.5" />Best sellers</p>
                        <p className="mt-2 font-display text-2xl text-ink">${bestSellers.length}</p>
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="font-display text-2xl text-ink">Best seller products</p>
                            <p className="mt-1 text-sm text-muted">Top products returned by the API, sorted by product sales or estimated sales.</p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted">
                            <${TrendingUp} className="h-4 w-4 text-accent" />
                            Sorted by estimated sales
                        </span>
                    </div>
                    ${bestSellers.length ? html`
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
                            ${bestSellers.map((product) => html`
                                <${TheSanPhamBanChay} key=${product.id} product=${product} shop=${shop} />
                            `)}
                        </div>
                    ` : html`
                        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-6 text-sm leading-6 text-muted">
                            The API has not returned product-level listings for this shop yet. Once the API returns multiple listings with listing URLs and sales values for the same shop, the top 4 products will appear here automatically.
                        </div>
                    `}
                </section>
            </div>
        </div>
    `;
}

export function TrangTheoDoiDoiThu({ listings, isLoading, error, refetch, timeframe }) {
    const [selectedShop, setSelectedShop] = useState(null);
    const topSalesShop = [...listings].sort((first, second) => second.sales30Day - first.sales30Day)[0];
    const topViewsShop = [...listings].sort((first, second) => second.views - first.views)[0];
    const topFavoritesShop = [...listings].sort((first, second) => second.shopFavorites - first.shopFavorites)[0];

    return html`
        <main className="pr-2">
            <section className="mb-5 flex items-end justify-between gap-6">
                <div>
                    <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-sunrise">Competitor Tracking</p>
                    <h1 className="font-display text-[2.2rem] tracking-tight text-ink">Shop rank monitor</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        Track competitor shops with the same dense grid style as Product Research, then open any shop to inspect views, sales, favorites, and best sellers.
                    </p>
                </div>
                <div className="rounded-[26px] border border-border bg-white px-5 py-3 shadow-sm">
                    <p className="stat-label text-[10px] text-muted">Tracked shops</p>
                    <p className="mt-1 font-display text-2xl text-sunrise">${isLoading ? "..." : listings.length}</p>
                </div>
            </section>

            <section className="mb-5 grid grid-cols-3 gap-4">
                <div className="surface-panel rounded-[28px] p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                        <${BarChart3} className="h-4 w-4 text-accent" />
                        Sales Leader
                    </div>
                    ${topSalesShop ? html`
                        <p className="font-display text-xl text-ink">${topSalesShop.shopName}</p>
                        <p className="mt-2 text-sm text-muted">${dinhDangSoGon(topSalesShop.sales30Day)} sales over 30 days.</p>
                    ` : html`<p className="text-sm text-muted">Sales leader appears after competitor data loads.</p>`}
                </div>

                <div className="surface-panel rounded-[28px] p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                        <${Eye} className="h-4 w-4 text-sunrise" />
                        View Leader
                    </div>
                    ${topViewsShop ? html`
                        <p className="font-display text-xl text-ink">${topViewsShop.shopName}</p>
                        <p className="mt-2 text-sm text-muted">${dinhDangSoGon(topViewsShop.views)} tracked views.</p>
                    ` : html`<p className="text-sm text-muted">View leader appears after competitor data loads.</p>`}
                </div>

                <div className="surface-panel rounded-[28px] p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                        <${Heart} className="h-4 w-4 text-accent" />
                        Favorite Leader
                    </div>
                    ${topFavoritesShop ? html`
                        <p className="font-display text-xl text-ink">${topFavoritesShop.shopName}</p>
                        <p className="mt-2 text-sm text-muted">${dinhDangSoGon(topFavoritesShop.shopFavorites)} shop favorites.</p>
                    ` : html`<p className="text-sm text-muted">Favorite leader appears after competitor data loads.</p>`}
                </div>
            </section>

            <section className="mb-4 flex items-center justify-between">
                <div>
                    <p className="font-display text-2xl text-ink">Competitor Grid</p>
                    <p className="mt-1 text-sm text-muted">Click any shop card to open rank lines and best seller products.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted">
                    <${ArrowUpRight} className="h-4 w-4 text-accent" />
                    ${isLoading ? "Loading..." : `${listings.length} shops visible`}
                </span>
            </section>

            ${isLoading ? html`
                <${LuoiKhungTai} />
            ` : error ? html`
                <${TrangThaiDuPhong}
                    tone="error"
                    title="Competitor API returned an error"
                    description=${error}
                    onRetry=${refetch}
                    actionLabel="Reload competitors"
                />
            ` : listings.length ? html`
                <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-8">
                    ${listings.map((listing) => html`
                        <${TheDoiThu}
                            key=${listing.listingId}
                            listing=${listing}
                            timeframe=${timeframe}
                            onSelect=${setSelectedShop}
                        />
                    `)}
                </section>
            ` : html`
                <${TrangThaiDuPhong}
                    tone="empty"
                    title="No competitor shops found"
                    description="Widen the category or keyword filter to load competitor shops for tracking."
                    onRetry=${refetch}
                    actionLabel="Reload competitors"
                />
            `}

            <${HopThoaiDoiThu} shop=${selectedShop} onClose=${() => setSelectedShop(null)} />
        </main>
    `;
}

export { TrangTheoDoiDoiThu as CompetitorTrackingPage };
