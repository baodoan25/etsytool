export { HopThoaiListing as HopThoaiSanPham, HopThoaiListing as ProductModal } from "./ListingModal.js";
/*
import { useEffect } from "react";
import { ArrowUpRight, BarChart3, Eye, Heart, Store, Tags, X } from "lucide-react";
import {
    buildListingDisplayTitle,
    formatCurrency,
    formatCompactNumber,
    formatNumber,
    getTimeframeLabel,
} from "../utils/formatters.js";
import { html } from "../utils/html.js";
import { useListingDetails } from "../hooks/useListingDetails.js";
import { FallbackState } from "./FallbackState.js";
import { ModalSkeleton } from "./ModalSkeleton.js";

const metricCards = [
    { key: "price", label: "Price", icon: Store, formatter: formatCurrency },
    { key: "estimatedSales", label: "Estimated Sales", icon: BarChart3, formatter: formatNumber },
    { key: "views", label: "Views", icon: Eye, formatter: formatCompactNumber },
    { key: "favorites", label: "Favorites", icon: Heart, formatter: formatNumber },
];

function TagBadge({ tag, index }) {
    return html`
        <div className=${`rounded-[22px] border px-4 py-3 transition ${
            tag.isPlaceholder
                ? "border-dashed border-border bg-canvas/70"
                : "border-border bg-white shadow-sm"
        }`}>
            <div className="flex items-center gap-3">
                <div className=${`h-10 w-1.5 rounded-full ${tag.isPlaceholder ? "bg-border" : "bg-gradient-to-b from-accent to-sunrise"}`}></div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <span className=${`line-clamp-1 text-sm font-semibold ${tag.isPlaceholder ? "text-muted" : "text-ink"}`}>
                            ${tag.label}
                        </span>
                        <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                            T${index + 1}
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <div className=${`h-2 rounded-full ${tag.isPlaceholder ? "w-10 bg-border" : "w-12 bg-accentSoft"}`}></div>
                        <div className=${`h-2 rounded-full ${tag.isPlaceholder ? "w-8 bg-border" : "w-8 bg-sunriseSoft"}`}></div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                            Future metrics
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
*/

/*
export function HopThoaiSanPham({ listing, timeframe, onClose }) {
    const { details, isLoading, error, refetch } = dungChiTietListing(listing);

    useEffect(() => {
        if (!listing) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [listing, onClose]);

    if (!listing) {
        return null;
    }

    return html`
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-10 py-10 backdrop-blur-sm"
            onClick=${onClose}
        >
            <div
                className="relative"
                onClick=${(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
            >
                <button
                    type="button"
                    onClick=${onClose}
                    className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-muted transition hover:text-ink"
                    aria-label="Close modal"
                >
                    <${X} className="h-5 w-5" />
                </button>

                ${isLoading ? html`
                    <${KhungTaiHopThoai} />
                ` : error ? html`
                    <div className="w-[min(920px,calc(100vw-120px))]">
                        <${TrangThaiDuPhong}
                            tone="error"
                            title="Listing detail API is not responding"
                            description=${error}
                            onRetry=${refetch}
                            actionLabel="Reload listing detail"
                        />
                    </div>
                ` : details ? html`
                    <div className="surface-panel app-scrollbar relative grid h-[calc(100vh-80px)] w-[min(1220px,calc(100vw-120px))] grid-cols-[420px_minmax(0,1fr)] overflow-hidden rounded-[36px]">
                        <section className="app-scrollbar overflow-y-auto border-r border-border bg-canvas/65 p-8">
                            <img
                                src=${details.imageUrl || listing.thumbnailUrl}
                                alt=${details.title}
                                className="h-[320px] w-full rounded-[28px] border border-white/80 object-cover shadow-panel"
                            />

                            <div className="mt-6">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                                        Listing Detail
                                    </span>
                                    <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                                        ${layNhanKhoangThoiGian(timeframe)}
                                    </span>
                                </div>

                                <h2 id="product-modal-title" className="font-display text-[2rem] leading-tight text-ink">
                                    ${details.title || taoTieuDeHienThiListing(listing.listingId)}
                                </h2>

                                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                                    <span className="rounded-full bg-white px-3 py-1 font-medium">ID ${listing.listingId}</span>
                                    <a
                                        href=${listing.shopUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium transition hover:text-accent"
                                    >
                                        <${Store} className="h-3.5 w-3.5" />
                                        ${listing.shopName}
                                    </a>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    ${cacTheChiSo.map((metric) => {
                                        const Icon = metric.icon;

                                        return html`
                                            <div key=${metric.key} className="rounded-[22px] border border-border bg-white px-4 py-3">
                                                <div className="stat-label flex items-center gap-2 text-[10px] text-muted">
                                                    <${Icon} className="h-3.5 w-3.5" />
                                                    ${metric.label}
                                                </div>
                                                <div className="mt-2 font-display text-2xl text-ink">
                                                    ${metric.formatter(listing[metric.key])}
                                                </div>
                                            </div>
                                        `;
                                    })}
                                </div>

                                <a
                                    href=${details.listingUrl || listing.shopUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-sunrise"
                                >
                                    View on Etsy
                                    <${ArrowUpRight} className="h-4 w-4" />
                                </a>
                            </div>
                        </section>

                        <section className="app-scrollbar overflow-y-auto p-8">
                            <div className="mb-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                                    <${Tags} className="h-4 w-4 text-accent" />
                                    Listing Tags
                                </div>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Hiển thị đủ 13 tag của listing. Mỗi badge đã chừa sẵn vùng placeholder để gắn Search Volume, Competition, hoặc các chỉ số phụ sau này.
                                </p>
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                                <p className="font-display text-xl text-ink">13 Tag Slots</p>
                                <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                                    Etsy detail payload
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                ${details.tags.map((tag, index) => html`
                                    <${NhanThe} key=${tag.id} tag=${tag} index=${index} />
                                `)}
                            </div>
                        </section>
                    </div>
                ` : null}
            </div>
        </div>
    `;
}

*/
