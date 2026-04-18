import { useDeferredValue, useEffect, useState } from "react";
import { CalendarDays, Search, Sparkles, TrendingUp } from "lucide-react";
import { dungThongTinTuKhoa } from "../hooks/useKeywordInsights.js";
import { dinhDangSoGon, dinhDangSo } from "../utils/formatters.js";
import { html } from "../utils/html.js";
import { TrangThaiDuPhong } from "./FallbackState.js";

const cacLuaChonKhoangThoiGian = [
    { value: "1", label: "1 Day" },
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
];

const cacLuaChonSapXep = [
    { value: "sales", label: "Sales" },
    { value: "score", label: "Score" },
    { value: "new-listings", label: "New Listings" },
    { value: "holiday-fit", label: "USA Holiday Fit" },
];

function KhungTaiTuKhoa() {
    return html`
        <div className="overflow-hidden rounded-[28px] border border-border bg-white shadow-panel">
            ${Array.from({ length: 8 }, (_, index) => html`
                <div key=${`keyword-skeleton-${index}`} className="grid grid-cols-[2fr_1.25fr_0.7fr_1.05fr_1.8fr_1.8fr] gap-6 border-b border-border px-6 py-6 last:border-b-0">
                    <div className="skeleton-block h-5 w-44 rounded-full"></div>
                    <div>
                        <div className="skeleton-block h-5 w-16 rounded-full"></div>
                        <div className="skeleton-block mt-2 h-3 w-32 rounded-full"></div>
                    </div>
                    <div className="skeleton-block h-5 w-10 rounded-full"></div>
                    <div className="skeleton-block h-5 w-24 rounded-full"></div>
                    <div className="skeleton-block h-5 w-52 rounded-full"></div>
                    <div className="skeleton-block h-8 w-44 rounded-full"></div>
                </div>
            `)}
        </div>
    `;
}

function NhanPhanTram({ label, value, tone }) {
    const toneClass = tone === "digital"
        ? "bg-sunriseSoft text-sunrise"
        : "bg-blue-50 text-blue-700";

    return html`
        <span className=${`rounded-full px-3 py-1 text-sm font-medium ${toneClass}`}>
            ${label} ${value}%
        </span>
    `;
}

function NhanNgayLe({ item }) {
    const fitClass = item.holidayFit === "High"
        ? "bg-successSoft text-success"
        : item.holidayFit === "Medium"
            ? "bg-accentSoft text-accent"
            : "bg-canvas text-muted";

    return html`
        <div className="rounded-2xl border border-border bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <${CalendarDays} className="h-4 w-4 text-accent" />
                        <span className="line-clamp-1 text-sm font-semibold text-ink">${item.holiday}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">${item.holidayDate} · USA</p>
                </div>
                <span className=${`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${fitClass}`}>
                    ${item.holidayFit}
                </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">${item.holidayReason}</p>
        </div>
    `;
}

function DongTuKhoa({ item, index }) {
    return html`
        <tr className=${index % 2 === 0 ? "bg-canvas/70" : "bg-white"}>
            <td className="px-6 py-6 align-middle">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-sunrise shadow-sm">
                        ${index + 1}
                    </span>
                    <div>
                        <p className="text-lg font-semibold tracking-tight text-ink">${item.keyword}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">Top tag by current sales</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-6 align-middle">
                <div className="text-lg font-semibold text-ink">
                    ${dinhDangSo(item.sales)}
                    <span className="ml-2 text-sm font-medium text-success">↑ ${dinhDangSo(item.growthPercent)}%</span>
                </div>
                <p className="mt-1 text-sm text-muted">Previous period: ${dinhDangSo(item.previousSales)} sales</p>
            </td>
            <td className="px-6 py-6 align-middle">
                <span className="font-display text-xl text-sunrise">${item.score}</span>
            </td>
            <td className="px-6 py-6 align-middle">
                <div className="text-lg font-semibold text-ink">
                    ${dinhDangSo(item.newListings)}
                    <span className="ml-2 text-sm font-medium text-success">↑ ${dinhDangSo(item.newListingsGrowthPercent)}%</span>
                </div>
            </td>
            <td className="px-6 py-6 align-middle">
                <div className="mb-2 font-semibold text-ink">${dinhDangSoGon(item.totalListings)}</div>
                <div className="flex flex-wrap gap-2">
                    <${NhanPhanTram} label="Physical" value=${item.physicalPercent} tone="physical" />
                    <${NhanPhanTram} label="Digital" value=${item.digitalPercent} tone="digital" />
                </div>
            </td>
            <td className="px-6 py-6 align-middle">
                <${NhanNgayLe} item=${item} />
            </td>
        </tr>
    `;
}

export function TrangThongTinTuKhoa({ initialQuery = "" }) {
    const [query, setQuery] = useState("");
    const [timeframe, setTimeframe] = useState("1");
    const [sortBy, setSortBy] = useState("sales");
    const truyVanTriHoan = useDeferredValue(query);
    const { items, isLoading, error, refetch } = dungThongTinTuKhoa({
        query: truyVanTriHoan,
        timeframe,
        sortBy,
    });

    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            setSortBy("holiday-fit");
        }
    }, [initialQuery]);

    return html`
        <main className="pr-2">
            <section className="mb-5 flex items-end justify-between gap-6">
                <div>
                    <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-sunrise">Keyword Insights</p>
                    <h1 className="font-display text-[2.2rem] tracking-tight text-ink">13 Top Sales Tags + USA Holiday Fit</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        Track the strongest Etsy tags by current sales, compare digital vs physical intent, and map each keyword to a relevant USA holiday launch window.
                    </p>
                </div>
                <div className="rounded-[26px] border border-border bg-white px-5 py-3 shadow-sm">
                    <p className="stat-label text-[10px] text-muted">Visible Tags</p>
                    <p className="mt-1 font-display text-2xl text-sunrise">${isLoading ? "..." : items.length}</p>
                </div>
            </section>

            <section className="surface-panel mb-5 rounded-[30px] p-5">
                <div className="flex items-center justify-center gap-3">
                    <label className="relative w-[360px]">
                        <${Search} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value=${query}
                            onChange=${(event) => setQuery(event.target.value)}
                            placeholder="Your keyword"
                            className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:ring-0"
                        />
                    </label>

                    <select
                        value=${timeframe}
                        onChange=${(event) => setTimeframe(event.target.value)}
                        className="filter-select h-12 w-[180px] rounded-xl border border-border bg-white px-4 pr-8 text-sm font-medium text-ink focus:border-accent focus:ring-0"
                    >
                        ${cacLuaChonKhoangThoiGian.map((option) => html`<option key=${option.value} value=${option.value}>${option.label}</option>`)}
                    </select>

                    <div className="relative">
                        <span className="absolute -top-3 left-4 bg-white px-2 text-xs text-muted">sort by</span>
                        <select
                            value=${sortBy}
                            onChange=${(event) => setSortBy(event.target.value)}
                            className="filter-select h-12 w-[220px] rounded-xl border border-border bg-white px-4 pr-8 text-sm font-medium text-ink focus:border-accent focus:ring-0"
                        >
                            ${cacLuaChonSapXep.map((option) => html`<option key=${option.value} value=${option.value}>${option.label}</option>`)}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick=${refetch}
                        className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white transition hover:bg-sunrise"
                    >
                        <${Sparkles} className="h-4 w-4" />
                        Search
                    </button>
                </div>
            </section>

            ${isLoading ? html`
                <${KhungTaiTuKhoa} />
            ` : error ? html`
                <${TrangThaiDuPhong}
                    tone="error"
                    title="Keyword insights API returned an error"
                    description=${error}
                    onRetry=${refetch}
                    actionLabel="Reload keyword insights"
                />
            ` : items.length ? html`
                <section className="overflow-hidden rounded-[30px] border border-border bg-white shadow-panel">
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <${TrendingUp} className="h-4 w-4 text-accent" />
                            Ranked by ${cacLuaChonSapXep.find((option) => option.value === sortBy)?.label || "Sales"}
                        </div>
                        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                            USA market holiday mapping
                        </span>
                    </div>
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-white">
                            <tr className="border-b border-border text-xs uppercase tracking-[0.14em] text-ink">
                                <th className="px-6 py-4 font-semibold">Keyword</th>
                                <th className="px-6 py-4 font-semibold">Sales</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">New Listings</th>
                                <th className="px-6 py-4 font-semibold">Total Listings</th>
                                <th className="px-6 py-4 font-semibold">USA Holiday Fit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item, index) => html`
                                <${DongTuKhoa} key=${item.keyword} item=${item} index=${index} />
                            `)}
                        </tbody>
                    </table>
                </section>
            ` : html`
                <${TrangThaiDuPhong}
                    tone="empty"
                    title="No keyword tags found"
                    description="Try a broader keyword, switch timeframe, or sort by sales to reload the top 13 tag opportunities."
                    onRetry=${() => setQuery("")}
                    actionLabel="Clear keyword"
                />
            `}
        </main>
    `;
}

export { TrangThongTinTuKhoa as KeywordInsightsPage };
