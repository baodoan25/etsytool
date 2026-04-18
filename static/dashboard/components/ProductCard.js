import { ArrowUpRight, BarChart3, CalendarDays, Heart, MapPin, MessageSquare, Package, Store } from "lucide-react";
import {
    dinhDangSoGon,
    dinhDangSo,
} from "../utils/formatters.js";
import { html } from "../utils/html.js";
import { resolveSafeExternalUrl } from "../utils/urlResolvers.js";

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

export function TheSanPham({ listing, timeframe, onSelect }) {
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
                            ${listing.country ? html`
                                <span className="inline-flex items-center gap-1">
                                    <${MapPin} className="h-3.5 w-3.5" />
                                    ${listing.country}
                                </span>
                            ` : null}
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
                        onClick=${(event) => event.stopPropagation()}
                        className="h-10 rounded-lg border border-border bg-white text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                        Follow
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
                        <${Store} className="h-3.5 w-3.5" />
                        Top shop by category
                    </span>
                    <span className="font-semibold text-sunrise">
                        ${dinhDangSo(listing.estimatedSales)} selected-period sales
                    </span>
                </div>
            </div>
        </article>
    `;
}
