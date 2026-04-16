import { useDeferredValue, useState } from "react";
import { ArrowUpRight, BarChart3, Heart, Store } from "lucide-react";
import { Sidebar } from "./components/Sidebar.js";
import { Header } from "./components/Header.js";
import { KeywordInsightsResearchPage } from "./components/KeywordInsightsResearchPage.js";
import { EtsyEventCalendarPage } from "./components/EtsyEventCalendarPage.js";
import { CompetitorTrackingPage } from "./components/CompetitorTrackingPage.js";
import { ProductCard } from "./components/ProductCard.js";
import { ListingModal } from "./components/ListingModal.js";
import { FallbackState } from "./components/FallbackState.js";
import { GridSkeleton } from "./components/GridSkeleton.js";
import { useFetchTopListings } from "./hooks/useFetchTopListings.js";
import { formatCompactNumber, formatNumber } from "./utils/formatters.js";
import { html } from "./utils/html.js";

function getTodayDateValue() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function createInitialFilters() {
    return {
        date: getTodayDateValue(),
        searchMode: "keyword",
        searchQuery: "",
        createdTime: "all",
        category: "all",
        timeframe: "7",
        sortBy: "best-selling",
        potentialOnly: false,
    };
}

function normalizeCategoryOption(option) {
    if (typeof option === "string") {
        return { value: option, label: option };
    }

    return {
        value: String(option?.value || option?.id || option?.slug || "all"),
        label: String(option?.label || option?.name || option?.value || "All Etsy Categories"),
    };
}

const defaultCategories = [
    { value: "all", label: "All Etsy Categories" },
    { value: "clothing", label: "Clothing" },
    { value: "home-and-living", label: "Home & Living" },
    { value: "jewelry", label: "Jewelry" },
    { value: "art-and-collectibles", label: "Art & Collectibles" },
    { value: "craft-supplies-and-tools", label: "Craft Supplies & Tools" },
    { value: "paper-and-party-supplies", label: "Paper & Party Supplies" },
    { value: "weddings", label: "Weddings" },
];

export function AppRoot() {
    const categoryOptions = (window.__POD_RESEARCH_TAXONOMY__ || defaultCategories).map(normalizeCategoryOption);
    const [filters, setFilters] = useState(createInitialFilters);
    const [activeSection, setActiveSection] = useState("research");
    const [keywordInsightQuery, setKeywordInsightQuery] = useState("");
    const [selectedListing, setSelectedListing] = useState(null);
    const deferredQuery = useDeferredValue(filters.searchQuery);
    const apiFilters = {
        ...filters,
        searchQuery: deferredQuery.trim(),
    };
    const { items: listings, isLoading, error, refetch } = useFetchTopListings(apiFilters);

    const topEstimatedListing = [...listings].sort((first, second) => second.estimatedSales - first.estimatedSales)[0];
    const largestShopListing = [...listings].sort((first, second) => second.totalShopSales - first.totalShopSales)[0];
    const favoriteLeader = [...listings].sort((first, second) => second.favorites - first.favorites)[0];

    const handleFilterChange = (field, value) => {
        setFilters((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const resetFilters = () => {
        setFilters(createInitialFilters());
    };

    const openKeywordInsight = (keyword) => {
        setKeywordInsightQuery(keyword);
        setActiveSection("keywords");
    };

    return html`
        <div className="relative flex min-h-screen items-start overflow-visible">
            <div className="backdrop-mesh pointer-events-none fixed inset-0 opacity-50"></div>

            <${Sidebar} activeItem=${activeSection} onSelect=${setActiveSection} />

            <div className="relative z-10 min-w-0 flex-1 px-6 py-5">
                ${activeSection === "keywords" ? html`
                    <${KeywordInsightsResearchPage} initialQuery=${keywordInsightQuery} />
                ` : activeSection === "calendar" ? html`
                    <${EtsyEventCalendarPage} onKeywordSelect=${openKeywordInsight} />
                ` : activeSection === "competitors" ? html`
                    <${CompetitorTrackingPage}
                        listings=${listings}
                        isLoading=${isLoading}
                        error=${error}
                        refetch=${refetch}
                        timeframe=${filters.timeframe}
                    />
                ` : html`
                    <${Header}
                        categories=${categoryOptions}
                        filters=${filters}
                        onFilterChange=${handleFilterChange}
                        resultCount=${listings.length}
                        topEstimatedSales=${formatNumber(topEstimatedListing?.estimatedSales || 0)}
                        maxShopSales=${formatCompactNumber(largestShopListing?.totalShopSales || 0)}
                        maxFavorites=${formatCompactNumber(favoriteLeader?.favorites || 0)}
                        isLoading=${isLoading}
                    />

                    <main className="pr-2">
                    <section className="mb-5 grid grid-cols-3 gap-4">
                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${BarChart3} className="h-4 w-4 text-accent" />
                                Top Estimated Sales
                            </div>
                            ${topEstimatedListing ? html`
                                <p className="font-display text-xl text-ink">${topEstimatedListing.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    Strongest shop in the current API response with ${formatNumber(topEstimatedListing.estimatedSales)} estimated sales for the selected timeframe.
                                </p>
                            ` : html`<p className="text-sm text-muted">The top estimated-sales shop will appear here after the API returns data.</p>`}
                        </div>

                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${Store} className="h-4 w-4 text-sunrise" />
                                Largest Shop Footprint
                            </div>
                            ${largestShopListing ? html`
                                <p className="font-display text-xl text-ink">${largestShopListing.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    Highest tracked shop total inside the current category result set at ${formatCompactNumber(largestShopListing.totalShopSales)} cumulative sales.
                                </p>
                            ` : html`<p className="text-sm text-muted">Largest tracked shop sales will appear here when the API responds.</p>`}
                        </div>

                        <div className="surface-panel rounded-[28px] p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
                                <${Heart} className="h-4 w-4 text-accent" />
                                Favorite Leader
                            </div>
                            ${favoriteLeader ? html`
                                <p className="font-display text-xl text-ink">${favoriteLeader.shopName}</p>
                                <p className="mt-2 text-sm text-muted">
                                    This shop currently leads the returned grid with ${formatCompactNumber(favoriteLeader.favorites)} favorites.
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
                        <${GridSkeleton} />
                    ` : error ? html`
                        <${FallbackState}
                            tone="error"
                            title="Top listings API returned an error"
                            description=${error}
                            onRetry=${refetch}
                            actionLabel="Reload research grid"
                        />
                    ` : listings.length ? html`
                        <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 pb-8">
                            ${listings.map((listing) => html`
                                <${ProductCard}
                                    key=${listing.listingId}
                                    listing=${listing}
                                    timeframe=${filters.timeframe}
                                    onSelect=${setSelectedListing}
                                />
                            `)}
                        </section>
                    ` : html`
                        <${FallbackState}
                            tone="empty"
                            title="No top shops found for this niche"
                            description="The API returned no active Etsy listings for the selected taxonomy category, research date, timeframe, and niche query. Reset the filters or widen the category scope to continue."
                            onRetry=${resetFilters}
                            actionLabel="Reset filters"
                        />
                    `}
                    </main>
                `}
            </div>

            <${ListingModal}
                listing=${selectedListing}
                timeframe=${filters.timeframe}
                onClose=${() => setSelectedListing(null)}
            />
        </div>
    `;
}
