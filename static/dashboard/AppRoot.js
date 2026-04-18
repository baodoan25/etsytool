import { useDeferredValue, useState } from "react";
import { ArrowUpRight, BarChart3, Heart, Store } from "lucide-react";
import { ThanhBen } from "./components/Sidebar.js";
import { DauTrang } from "./components/Header.js?v=20260418-normalizer-fix";
import { TrangNghienCuuThongTinTuKhoa } from "./components/KeywordInsightsResearchPage.js";
import { TrangLichSuKienEtsy } from "./components/EtsyEventCalendarPage.js";
import { TrangTheoDoiDoiThu } from "./components/CompetitorTrackingPage.js";
import { TheSanPham } from "./components/ProductCard.js";
import { HopThoaiListing } from "./components/ListingModal.js";
import { TrangThaiDuPhong } from "./components/FallbackState.js";
import { LuoiKhungTai } from "./components/GridSkeleton.js";
import { dungTaiListingHangDau } from "./hooks/useFetchTopListings.js?v=20260418-normalizer-fix";
import { dinhDangSoGon, dinhDangSo } from "./utils/formatters.js";
import { html } from "./utils/html.js";

function layGiaTriNgayHomNay() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function taoBoLocBanDau() {
    return {
        date: layGiaTriNgayHomNay(),
        searchMode: "keyword",
        searchQuery: "",
        createdTime: "all",
        category: "all",
        timeframe: "7",
        sortBy: "best-selling",
        potentialOnly: false,
    };
}

function chuanHoaLuaChonDanhMuc(option) {
    if (typeof option === "string") {
        return { value: option, label: option };
    }

    return {
        value: String(option?.value || option?.id || option?.slug || "all"),
        label: String(option?.label || option?.name || option?.value || "All Etsy Categories"),
    };
}

const cacDanhMucMacDinh = [
    { value: "all", label: "All Etsy Categories" },
    { value: "clothing", label: "Clothing" },
    { value: "home-and-living", label: "Home & Living" },
    { value: "jewelry", label: "Jewelry" },
    { value: "art-and-collectibles", label: "Art & Collectibles" },
    { value: "craft-supplies-and-tools", label: "Craft Supplies & Tools" },
    { value: "paper-and-party-supplies", label: "Paper & Party Supplies" },
    { value: "weddings", label: "Weddings" },
];

export function GocUngDung() {
    const cacLuaChonDanhMuc = (window.__POD_RESEARCH_TAXONOMY__ || cacDanhMucMacDinh).map(chuanHoaLuaChonDanhMuc);
    const [filters, setFilters] = useState(taoBoLocBanDau);
    const [activeSection, setActiveSection] = useState("research");
    const [keywordInsightQuery, setKeywordInsightQuery] = useState("");
    const [selectedListing, setSelectedListing] = useState(null);
    const truyVanTriHoan = useDeferredValue(filters.searchQuery);
    const boLocApi = {
        ...filters,
        searchQuery: truyVanTriHoan.trim(),
    };
    const { items: listings, isLoading, error, refetch } = dungTaiListingHangDau(boLocApi);

    const listingUocTinhCaoNhat = [...listings].sort((first, second) => second.estimatedSales - first.estimatedSales)[0];
    const listingShopLonNhat = [...listings].sort((first, second) => second.totalShopSales - first.totalShopSales)[0];
    const listingDanDauYeuThich = [...listings].sort((first, second) => second.favorites - first.favorites)[0];

    const xuLyDoiBoLoc = (field, value) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const datLaiBoLoc = () => {
        setFilters(taoBoLocBanDau());
    };

    const moThongTinTuKhoa = (keyword) => {
        setKeywordInsightQuery(keyword);
        setActiveSection("keywords");
    };

    return html`
        <div className="relative flex min-h-screen items-start overflow-visible">
            <div className="backdrop-mesh pointer-events-none fixed inset-0 opacity-50"></div>

            <${ThanhBen} activeItem=${activeSection} onSelect=${setActiveSection} />

            <div className="relative z-10 min-w-0 flex-1 px-6 py-5">
                ${activeSection === "keywords" ? html`
                    <${TrangNghienCuuThongTinTuKhoa} initialQuery=${keywordInsightQuery} />
                ` : activeSection === "calendar" ? html`
                    <${TrangLichSuKienEtsy} onKeywordSelect=${moThongTinTuKhoa} />
                ` : activeSection === "competitors" ? html`
                    <${TrangTheoDoiDoiThu}
                        listings=${listings}
                        isLoading=${isLoading}
                        error=${error}
                        refetch=${refetch}
                        timeframe=${filters.timeframe}
                    />
                ` : html`
                    <${DauTrang}
                        categories=${cacLuaChonDanhMuc}
                        filters=${filters}
                        onFilterChange=${xuLyDoiBoLoc}
                        resultCount=${listings.length}
                        topEstimatedSales=${dinhDangSo(listingUocTinhCaoNhat?.estimatedSales || 0)}
                        maxShopSales=${dinhDangSoGon(listingShopLonNhat?.totalShopSales || 0)}
                        maxFavorites=${dinhDangSoGon(listingDanDauYeuThich?.favorites || 0)}
                        isLoading=${isLoading}
                    />

                    <main className="pr-2">
                    <section className="mb-5 grid grid-cols-3 gap-4">
                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${BarChart3} className="h-4 w-4 text-accent" />
                                Top Estimated Sales
                            </div>
                            ${listingUocTinhCaoNhat ? html`
                                <p className="font-display text-xl text-ink">${listingUocTinhCaoNhat.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    Strongest shop in the current API response with ${dinhDangSo(listingUocTinhCaoNhat.estimatedSales)} estimated sales for the selected timeframe.
                                </p>
                            ` : html`<p className="text-sm text-muted">The top estimated-sales shop will appear here after the API returns data.</p>`}
                        </div>

                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${Store} className="h-4 w-4 text-sunrise" />
                                Largest Shop Footprint
                            </div>
                            ${listingShopLonNhat ? html`
                                <p className="font-display text-xl text-ink">${listingShopLonNhat.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    Highest tracked shop total inside the current category result set at ${dinhDangSoGon(listingShopLonNhat.totalShopSales)} cumulative sales.
                                </p>
                            ` : html`<p className="text-sm text-muted">Largest tracked shop sales will appear here when the API responds.</p>`}
                        </div>

                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${Heart} className="h-4 w-4 text-accent" />
                                Favorite Leader
                            </div>
                            ${listingDanDauYeuThich ? html`
                                <p className="font-display text-xl text-ink">${listingDanDauYeuThich.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    This shop currently leads the returned grid with ${dinhDangSoGon(listingDanDauYeuThich.favorites)} favorites.
                                </p>
                            ` : html`<p className="text-sm text-muted">Shop favorite counts will appear here once the ranking API returns results.</p>`}
                        </div>
                    </section>

                    <section className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="font-display text-2xl text-ink">Research Grid</p>
                            <p className="mt-1 text-sm text-muted">
                                Shop ranking view sorted by selected-period sales, scoped to Etsy category and niche query.
                            </p>
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
                            title="Top listings API returned an error"
                            description=${error}
                            onRetry=${refetch}
                            actionLabel="Reload research grid"
                        />
                    ` : listings.length ? html`
                        <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-8">
                            ${listings.map((listing) => html`
                                <${TheSanPham}
                                    key=${listing.listingId}
                                    listing=${listing}
                                    timeframe=${filters.timeframe}
                                    onSelect=${setSelectedListing}
                                />
                            `)}
                        </section>
                    ` : html`
                        <${TrangThaiDuPhong}
                            tone="empty"
                            title="No top shops found for this niche"
                            description="The API returned no active Etsy listings for the selected taxonomy category, research date, timeframe, and niche query. Reset the filters or widen the category scope to continue."
                            onRetry=${datLaiBoLoc}
                            actionLabel="Reset filters"
                        />
                    `}
                    </main>
                `}
            </div>

            <${HopThoaiListing}
                listing=${selectedListing}
                timeframe=${filters.timeframe}
                onClose=${() => setSelectedListing(null)}
            />
        </div>
    `;
}

export { GocUngDung as AppRoot };
