import { Link2, Megaphone, Star, Tags } from "lucide-react";
import { cacThangSuKienUsa } from "../data/usaEvents.js";
import { html } from "../utils/html.js";

const cacSuKienQuanTrong = cacThangSuKienUsa.flatMap((month) => month.events).filter((event) => event.important);
const tongSuKien = cacThangSuKienUsa.reduce((total, month) => total + month.events.length, 0);

function TheSuKien({ event, onKeywordSelect }) {
    return html`
        <article className=${`rounded-2xl border p-4 ${
            event.important
                ? "border-accent/40 bg-accentSoft/70 shadow-sm"
                : "border-border bg-white"
        }`}>
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                        ${event.important ? html`<${Star} className="h-4 w-4 shrink-0 fill-accent text-accent" />` : null}
                        <h3 className=${`line-clamp-1 text-base tracking-tight text-ink ${event.important ? "font-bold" : "font-semibold"}`}>
                            ${event.title}
                        </h3>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sunrise">${event.date}</p>
                </div>
                <span className=${`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    event.important ? "bg-white text-accent" : "bg-canvas text-muted"
                }`}>
                    ${event.important ? "Key event" : "Seasonal"}
                </span>
            </div>

            <div className="mb-3 rounded-xl border border-border/80 bg-white/80 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Seller window</p>
                <p className="mt-1 text-sm font-semibold text-ink">${event.prepWindow}</p>
            </div>

            <p className="text-sm leading-6 text-muted">${event.sellerAction}</p>

            <div className="mt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    <${Tags} className="h-3.5 w-3.5 text-accent" />
                    Keyword Insights links
                </div>
                <div className="flex flex-wrap gap-2">
                    ${event.keywords.map((keyword) => html`
                        <button
                            key=${keyword}
                            type="button"
                            onClick=${() => onKeywordSelect(keyword)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                            title=${`Open Keyword Insights for ${keyword}`}
                        >
                            <${Link2} className="h-3.5 w-3.5" />
                            ${keyword}
                        </button>
                    `)}
                </div>
            </div>
        </article>
    `;
}

function KhoiThang({ month, onKeywordSelect }) {
    return html`
        <section className="overflow-hidden rounded-[28px] border border-border bg-white shadow-panel">
            <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-5 py-4">
                <h2 className="font-display text-xl text-ink">${month.month}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    ${month.events.length} events
                </span>
            </div>
            <div className="grid gap-4 p-4">
                ${month.events.map((event) => html`
                    <${TheSuKien} key=${`${month.month}-${event.title}`} event=${event} onKeywordSelect=${onKeywordSelect} />
                `)}
            </div>
        </section>
    `;
}

export function TrangLichSuKienEtsy({ onKeywordSelect }) {
    return html`
        <main className="pr-2">
            <section className="mb-5 flex items-end justify-between gap-6">
                <div>
                    <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-sunrise">Etsy Event Calendar</p>
                    <h1 className="font-display text-[2.2rem] tracking-tight text-ink">USA seller event calendar for 2026</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        A one-year planning board for Etsy sellers. Starred rows are major sales windows, and every keyword chip opens the connected Keyword Insights view.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[26px] border border-border bg-white px-5 py-3 shadow-sm">
                        <p className="stat-label text-[10px] text-muted">USA Events</p>
                        <p className="mt-1 font-display text-2xl text-sunrise">${tongSuKien}</p>
                    </div>
                    <div className="rounded-[26px] border border-accent/40 bg-accentSoft px-5 py-3 shadow-sm">
                        <p className="stat-label text-[10px] text-muted">Starred</p>
                        <p className="mt-1 font-display text-2xl text-sunrise">${cacSuKienQuanTrong.length}</p>
                    </div>
                </div>
            </section>

            <section className="surface-panel mb-5 rounded-[30px] p-5">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
                            <${Star} className="h-5 w-5 fill-accent" />
                        </span>
                        <div>
                            <p className="font-semibold text-ink">Star + bold = priority</p>
                            <p className="mt-1 text-sm leading-6 text-muted">These events usually need earlier listing, SEO, mockup, and ad preparation.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
                            <${Tags} className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="font-semibold text-ink">Keyword chips</p>
                            <p className="mt-1 text-sm leading-6 text-muted">Click any keyword to research sales signals, listing volume, and holiday fit.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-accent shadow-sm">
                            <${Megaphone} className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="font-semibold text-ink">Seller action</p>
                            <p className="mt-1 text-sm leading-6 text-muted">Each event includes a launch window and practical product angles for Etsy sellers.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 pb-8">
                ${cacThangSuKienUsa.map((month) => html`
                    <${KhoiThang} key=${month.month} month=${month} onKeywordSelect=${onKeywordSelect} />
                `)}
            </section>
        </main>
    `;
}
