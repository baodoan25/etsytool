import { useDeferredValue, useEffect, useState } from "react";
import { Search, TrendingUp, X } from "lucide-react";
import { useKeywordInsights } from "../hooks/useKeywordInsights.js";
import { formatCompactNumber, formatNumber } from "../utils/formatters.js";
import { html } from "../utils/html.js";
import { FallbackState } from "./FallbackState.js";

const timeframeOptions = [
    { value: "1", label: "1 Day" },
    { value: "3", label: "3 Days" },
    { value: "7", label: "7 Days" },
];

const sortOptions = [
    { value: "score", label: "Score" },
    { value: "sales", label: "Sales" },
    { value: "new-listings", label: "New Listings" },
    { value: "total-listings", label: "Total Listings" },
];

function KeywordSkeleton() {
    return html`
        <div className="overflow-hidden rounded-[10px] border border-border bg-white shadow-panel">
            ${Array.from({ length: 6 }, (_, index) => html`
                <div key=${`keyword-skeleton-${index}`} className="grid grid-cols-[1.7fr_1.3fr_0.7fr_1fr_1.35fr_0.8fr] gap-5 border-b border-border px-6 py-8 last:border-b-0">
                    <div className="skeleton-block h-5 w-52 rounded-full"></div>
                    <div>
                        <div className="skeleton-block h-5 w-20 rounded-full"></div>
                        <div className="skeleton-block mt-2 h-3 w-36 rounded-full"></div>
                    </div>
                    <div className="skeleton-block h-5 w-12 rounded-full"></div>
                    <div className="skeleton-block h-5 w-24 rounded-full"></div>
                    <div>
                        <div className="skeleton-block h-5 w-20 rounded-full"></div>
                        <div className="skeleton-block mt-2 h-5 w-44 rounded-full"></div>
                    </div>
                    <div className="skeleton-block h-10 w-24 rounded-lg"></div>
                </div>
            `)}
        </div>
    `;
}

function TrendValue({ value }) {
    const isPositive = Number(value) >= 0;

    return html`
        <span className=${`ml-2 text-sm font-medium ${isPositive ? "text-success" : "text-danger"}`}>
            ${isPositive ? "↑" : "↓"} ${formatNumber(Math.abs(value))}%
        </span>
    `;
}

function RatioBadges({ item }) {
    return html`
        <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                Physical ${formatNumber(item.physicalPercent)}%
            </span>
            <span className="rounded-full bg-sunriseSoft px-3 py-1 text-sm text-sunrise">
                Digital ${formatNumber(item.digitalPercent)}%
            </span>
        </div>
    `;
}

function KeywordDetailModal({ item, onClose }) {
    if (!item) {
        return null;
    }

    return html`
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-10 py-10 backdrop-blur-sm"
            onClick=${onClose}
        >
            <div
                className="surface-panel relative w-[min(760px,calc(100vw-80px))] rounded-[28px] p-7"
                onClick=${(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button
                    type="button"
                    onClick=${onClose}
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted transition hover:text-ink"
                    aria-label="Close keyword detail"
                >
                    <${X} className="h-5 w-5" />
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sunrise">Keyword Detail</p>
                <h2 className="mt-2 font-display text-3xl text-ink">${item.keyword}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                    Snapshot of sales velocity, listing competition, score, and physical versus digital demand for this Etsy tag.
                </p>

                <div className="mt-6 grid grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                        <p className="stat-label text-[10px] text-muted">Sales</p>
                        <p className="mt-2 font-display text-2xl text-ink">${formatNumber(item.sales)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                        <p className="stat-label text-[10px] text-muted">Score</p>
                        <p className="mt-2 font-display text-2xl text-sunrise">${formatNumber(item.score)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                        <p className="stat-label text-[10px] text-muted">New Listings</p>
                        <p className="mt-2 font-display text-2xl text-ink">${formatNumber(item.newListings)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                        <p className="stat-label text-[10px] text-muted">Total Listings</p>
                        <p className="mt-2 font-display text-2xl text-ink">${formatCompactNumber(item.totalListings)}</p>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-white px-5 py-4">
                    <p className="font-semibold text-ink">Demand split</p>
                    <${RatioBadges} item=${item} />
                </div>
            </div>
        </div>
    `;
}

function KeywordRow({ item, onDetail }) {
    return html`
        <tr className="border-b border-white bg-[#f1f1f1] last:border-b-0">
            <td className="px-6 py-8 align-middle">
                <p className="text-lg font-semibold tracking-tight text-ink">${item.keyword}</p>
            </td>
            <td className="px-6 py-8 align-middle">
                <div className="text-lg font-semibold text-ink">
                    ${formatNumber(item.sales)}
                    <${TrendValue} value=${item.growthPercent} />
                </div>
                <p className="mt-1 text-sm text-muted">Previous period: ${formatNumber(item.previousSales)} sales</p>
            </td>
            <td className="px-6 py-8 align-middle">
                <span className="font-display text-xl text-sunrise">${formatNumber(item.score)}</span>
            </td>
            <td className="px-6 py-8 align-middle">
                <div className="text-lg font-semibold text-ink">
                    ${formatNumber(item.newListings)}
                    <${TrendValue} value=${item.newListingsGrowthPercent} />
                </div>
            </td>
            <td className="px-6 py-8 align-middle">
                <div className="text-lg font-semibold text-ink">${formatCompactNumber(item.totalListings)}</div>
                <${RatioBadges} item=${item} />
            </td>
            <td className="px-6 py-8 align-middle">
                <button
                    type="button"
                    onClick=${() => onDetail(item)}
                    className="h-10 rounded-lg border border-border bg-white px-5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                    Detail
                </button>
            </td>
        </tr>
    `;
}

export function KeywordInsightsResearchPage({ initialQuery = "" }) {
    const [query, setQuery] = useState("");
    const [timeframe, setTimeframe] = useState("1");
    const [sortBy, setSortBy] = useState("score");
    const [selectedKeyword, setSelectedKeyword] = useState(null);
    const deferredQuery = useDeferredValue(query);
    const { items, meta, isLoading, error, refetch } = useKeywordInsights({
        query: deferredQuery,
        timeframe,
        sortBy,
    });
    const intent = meta?.intent || {};
    const expandedKeywords = Array.isArray(intent.expandedKeywords)
        ? intent.expandedKeywords.filter((keyword) => keyword && keyword !== intent.originalQuery).slice(0, 6)
        : [];

    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            setSortBy("score");
        }
    }, [initialQuery]);

    return html`
        <main className="pr-2">
            <section className="mb-5 flex items-end justify-between gap-6">
                <div>
                    <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-sunrise">Keyword Insights</p>
                    <h1 className="font-display text-[2.2rem] tracking-tight text-ink">Keyword Insights</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        Comprehensive insights from millions of Etsy tags.
                    </p>
                </div>
                <div className="rounded-[26px] border border-border bg-white px-5 py-3 shadow-sm">
                    <p className="stat-label text-[10px] text-muted">Visible Tags</p>
                    <p className="mt-1 font-display text-2xl text-sunrise">${isLoading ? "..." : items.length}</p>
                </div>
            </section>

            <section className="surface-panel mb-6 rounded-[10px] p-7">
                <div className="flex items-center justify-center gap-3">
                    <label className="relative w-[360px]">
                        <${Search} className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value=${query}
                            onChange=${(event) => setQuery(event.target.value)}
                            placeholder="Your keyword"
                            className="h-12 w-full rounded-lg border border-border bg-white px-4 pr-11 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:ring-0"
                        />
                    </label>

                    <select
                        value=${timeframe}
                        onChange=${(event) => setTimeframe(event.target.value)}
                        className="filter-select h-12 w-[180px] rounded-lg border border-border bg-white px-4 pr-8 text-sm font-medium text-ink focus:border-accent focus:ring-0"
                    >
                        ${timeframeOptions.map((option) => html`<option key=${option.value} value=${option.value}>${option.label}</option>`)}
                    </select>

                    <div className="relative">
                        <span className="absolute -top-3 left-4 bg-white px-2 text-xs text-muted">Sort by</span>
                        <select
                            value=${sortBy}
                            onChange=${(event) => setSortBy(event.target.value)}
                            className="filter-select h-12 w-[190px] rounded-lg border border-border bg-white px-4 pr-8 text-sm font-medium text-ink focus:border-accent focus:ring-0"
                        >
                            ${sortOptions.map((option) => html`<option key=${option.value} value=${option.value}>${option.label}</option>`)}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick=${refetch}
                        className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-7 text-sm font-semibold text-white transition hover:bg-sunrise"
                    >
                        Search
                    </button>
                </div>
                ${deferredQuery && expandedKeywords.length ? html`
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
                        <span className="font-semibold uppercase tracking-[0.14em] text-sunrise">
                            ${intent.source === "gemini" ? "AI expanded" : "Intent expanded"}
                        </span>
                        ${expandedKeywords.map((keyword) => html`
                            <button
                                key=${keyword}
                                type="button"
                                onClick=${() => setQuery(keyword)}
                                className="rounded-full border border-border bg-white px-3 py-1 font-medium text-ink transition hover:border-accent hover:text-accent"
                            >
                                ${keyword}
                            </button>
                        `)}
                    </div>
                ` : null}
            </section>

            ${isLoading ? html`
                <${KeywordSkeleton} />
            ` : error ? html`
                <${FallbackState}
                    tone="error"
                    title="Keyword insights API returned an error"
                    description=${error}
                    onRetry=${refetch}
                    actionLabel="Reload keyword insights"
                />
            ` : items.length ? html`
                <section className="overflow-hidden rounded-[10px] border border-border bg-white shadow-panel">
                    <div className="flex items-center justify-between border-b border-border px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                            <${TrendingUp} className="h-4 w-4 text-accent" />
                            Ranked by ${sortOptions.find((option) => option.value === sortBy)?.label || "Score"}
                        </div>
                        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                            Tag metrics
                        </span>
                    </div>
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-white">
                            <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-ink">
                                <th className="px-6 py-4 font-semibold">Keyword</th>
                                <th className="px-6 py-4 font-semibold">Sales</th>
                                <th className="px-6 py-4 font-semibold">Score</th>
                                <th className="px-6 py-4 font-semibold">New Listings</th>
                                <th className="px-6 py-4 font-semibold">Total Listings</th>
                                <th className="px-6 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((item) => html`
                                <${KeywordRow} key=${item.keyword} item=${item} onDetail=${setSelectedKeyword} />
                            `)}
                        </tbody>
                    </table>
                </section>
            ` : html`
                <${FallbackState}
                    tone="empty"
                    title="No keyword tags found"
                    description="Try a broader keyword or switch timeframe to reload tag opportunities."
                    onRetry=${() => setQuery("")}
                    actionLabel="Clear keyword"
                />
            `}

            <${KeywordDetailModal} item=${selectedKeyword} onClose=${() => setSelectedKeyword(null)} />
        </main>
    `;
}
