import { CircleHelp, Flame, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { html } from "../utils/html.js";

const cacCheDoTimKiem = [
    { value: "tag", label: "Tag" },
    { value: "keyword", label: "Keyword" },
    { value: "shop", label: "Shop ID/Name" },
];

const cacLuaChonThoiGianTao = [
    { value: "all", label: "Any time" },
    { value: "7", label: "< 7 days" },
    { value: "30", label: "< 30 days" },
];

const cacLuaChonKhoangThoiGian = [
    { value: "1", label: "1 Day" },
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
];

const cacLuaChonSapXep = [
    { value: "best-selling", label: "Best Selling" },
    { value: "newest", label: "Newest" },
    { value: "most-viewed", label: "Most Viewed" },
];

function layGoiYOTimKiem(searchMode) {
    if (searchMode === "tag") {
        return "Try: fathers day, mug wrap, pantry labels";
    }

    if (searchMode === "shop") {
        return "Try: SeedCult, CaitlynMinimalist, Craftcornerclub";
    }

    return "Search title, keyword, holiday, tag, shop...";
}

function layGoiYTimKiem(searchMode) {
    if (searchMode === "tag") {
        return "Tag query is sent to the backend API and should match listing tags in your tracked dataset.";
    }

    if (searchMode === "shop") {
        return "Shop search is sent to the backend and should match either shop name or shop ID.";
    }

    return "Keyword search is delegated to the backend so title and tag matching stay consistent with your tracked database.";
}

function ChonBoLoc({ label, value, onChange, options }) {
    const cacLuaChon = Array.isArray(options) ? options : [];
    const cacOption = [];

    for (const option of cacLuaChon) {
        cacOption.push(html`
            <option key=${option.value} value=${option.value}>${option.label}</option>
        `);
    }

    return html`
        <label className="min-w-[168px]">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">${label}</span>
            <select
                value=${value}
                onChange=${onChange}
                className="filter-select h-11 w-full rounded-2xl border border-border bg-white/90 px-4 pr-8 text-sm font-medium text-ink shadow-sm transition focus:border-accent focus:ring-0"
            >
                ${cacOption}
            </select>
        </label>
    `;
}

function TruongNgay({ value, onChange }) {
    return html`
        <label>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Research Date</span>
            <input
                type="date"
                value=${value}
                onChange=${onChange}
                className="h-11 w-full rounded-2xl border border-border bg-white/90 px-4 text-sm font-medium text-ink shadow-sm transition focus:border-accent focus:ring-0"
            />
        </label>
    `;
}

export function DauTrang({
    cacDanhMuc,
    categories,
    filters,
    onFilterChange,
    resultCount,
    topEstimatedSales,
    maxShopSales,
    maxFavorites,
    isLoading,
}) {
    const cacLuaChonDanhMuc = Array.isArray(cacDanhMuc)
        ? cacDanhMuc
        : Array.isArray(categories)
            ? categories
            : [];
    const cacOptionCheDoTimKiem = [];

    for (const mode of cacCheDoTimKiem) {
        cacOptionCheDoTimKiem.push(html`
            <option key=${mode.value} value=${mode.value}>${mode.label}</option>
        `);
    }

    return html`
        <header className="surface-panel mb-5 rounded-[30px] p-5">
            <div className="mb-5 flex items-start justify-between gap-5">
                <div>
                    <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-sunrise">VH Media Research Workspace</p>
                    <h1 className="font-display text-[2.1rem] tracking-tight text-ink">POD of VH Media - Research Tag and Title</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        Query Etsy shop leaders by category, timeframe, and niche keyword so the grid ranks shops by sales performance instead of random products.
                    </p>
                </div>

                <div className="grid shrink-0 grid-cols-3 gap-2.5">
                    <div className="rounded-[26px] border border-border bg-white px-4 py-3 shadow-sm">
                        <p className="stat-label text-[10px] text-muted">Visible Shops</p>
                        <p className="mt-1 font-display text-2xl text-ink">${isLoading ? "..." : resultCount}</p>
                    </div>
                    <div className="rounded-[26px] border border-border bg-white px-4 py-3 shadow-sm">
                        <p className="stat-label text-[10px] text-muted">Top Est. Sales</p>
                        <p className="mt-1 font-display text-2xl text-sunrise">${isLoading ? "..." : topEstimatedSales}</p>
                    </div>
                    <div className="rounded-[26px] border border-border bg-white px-4 py-3 shadow-sm">
                        <p className="stat-label text-[10px] text-muted">Largest Shop Sales</p>
                        <p className="mt-1 font-display text-2xl text-ink">${isLoading ? "..." : maxShopSales}</p>
                    </div>
                </div>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(420px,1.12fr)_minmax(360px,0.92fr)]">
                <div className="self-start rounded-[26px] border border-border bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted">
                        <${Search} className="h-4 w-4 text-accent" />
                        Multi-purpose search
                    </div>

                    <div className="grid grid-cols-[168px_minmax(0,1fr)] gap-3">
                        <label>
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Search Type</span>
                            <select
                                value=${filters.searchMode}
                                onChange=${(event) => onFilterChange("searchMode", event.target.value)}
                                className="filter-select h-11 w-full rounded-2xl border border-border bg-canvas px-4 pr-8 text-sm font-medium text-ink focus:border-accent focus:ring-0"
                            >
                                ${cacOptionCheDoTimKiem}
                            </select>
                        </label>

                        <label className="flex-1">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Search Query</span>
                            <div className="relative">
                                <${Search} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    value=${filters.searchQuery}
                                    onChange=${(event) => onFilterChange("searchQuery", event.target.value)}
                                    placeholder=${layGoiYOTimKiem(filters.searchMode)}
                                    className="h-11 w-full rounded-2xl border border-border bg-canvas pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:ring-0"
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted">
                                ${layGoiYTimKiem(filters.searchMode)}
                            </p>
                        </label>
                    </div>
                </div>

                <div className="rounded-[26px] border border-border bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted">
                        <${SlidersHorizontal} className="h-4 w-4 text-sunrise" />
                        Filter Stack
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <${TruongNgay}
                            value=${filters.date}
                            onChange=${(event) => onFilterChange("date", event.target.value)}
                        />
                        <${ChonBoLoc}
                            label="Category"
                            value=${filters.category}
                            onChange=${(event) => onFilterChange("category", event.target.value)}
                            options=${cacLuaChonDanhMuc}
                        />
                        <${ChonBoLoc}
                            label="Created Time"
                            value=${filters.createdTime}
                            onChange=${(event) => onFilterChange("createdTime", event.target.value)}
                            options=${cacLuaChonThoiGianTao}
                        />
                        <${ChonBoLoc}
                            label="Timeframe"
                            value=${filters.timeframe}
                            onChange=${(event) => onFilterChange("timeframe", event.target.value)}
                            options=${cacLuaChonKhoangThoiGian}
                        />
                        <div className="col-span-2">
                            <${ChonBoLoc}
                                label="Sort By"
                                value=${filters.sortBy}
                                onChange=${(event) => onFilterChange("sortBy", event.target.value)}
                                options=${cacLuaChonSapXep}
                            />
                        </div>
                    </div>

                    <label className="group/logic mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-amber-200 bg-sunriseSoft/70 px-4 py-3 transition hover:border-amber-300">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked=${filters.potentialOnly}
                                onChange=${(event) => onFilterChange("potentialOnly", event.target.checked)}
                                className="h-4 w-4 rounded border-amber-300 text-sunrise focus:ring-sunrise"
                            />
                            <div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                                    <${Flame} className="h-4 w-4 text-sunrise" />
                                    Potential Best Seller
                                </div>
                                <p className="text-xs text-muted">Surface listings that are ramping faster than the pack.</p>
                            </div>
                        </div>

                        <div className="relative">
                            <${CircleHelp} className="h-4 w-4 text-muted" />
                            <div className="pointer-events-none absolute right-0 top-7 w-72 rounded-2xl border border-border bg-white p-3 text-xs leading-5 text-muted opacity-0 shadow-panel transition duration-150 group-hover/logic:opacity-100">
                                Items created within 30 days AND (has 50+ sales OR 10+ good reviews)
                            </div>
                        </div>
                    </label>

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-canvas/80 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted">
                            <${Sparkles} className="h-4 w-4 text-accent" />
                            Date, taxonomy category, timeframe, query, and sorting all trigger a fresh backend request for updated estimated sales.
                        </div>
                        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                            Favorites peak: ${isLoading ? "..." : maxFavorites}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    `;
}

export { DauTrang as Header };
