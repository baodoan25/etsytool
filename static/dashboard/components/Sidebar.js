import {
    BarChart3,
    CalendarRange,
    Heart,
    Home,
    Search,
} from "lucide-react";
import { html } from "../utils/html.js";

const nguonLogo = "/static/dashboard/assets/vh-media-logo.png";

const cacMucDieuHuong = [
    { id: "research", label: "Product Research", icon: Home },
    { id: "keywords", label: "Keyword Insights", icon: Search },
    { id: "calendar", label: "Etsy Event Calendar", icon: CalendarRange },
    { id: "competitors", label: "Competitor Tracking", icon: BarChart3 },
    { id: "favorites", label: "Favorites", icon: Heart },
];

export function ThanhBen({ activeItem, onSelect }) {
    return html`
        <aside className="group/sidebar sticky top-0 relative flex h-screen w-[96px] shrink-0 flex-col border-r border-white/50 bg-sidebar/80 px-4 py-5 backdrop-blur-xl transition-all duration-300 ease-out hover:w-[248px]">
            <div className="mb-7 flex items-center gap-3 overflow-hidden rounded-[28px] sidebar-pill px-3 py-3">
                <img
                    src=${nguonLogo}
                    alt="VH Media"
                    className="h-12 w-12 shrink-0 rounded-2xl object-cover shadow-panel"
                />
                <div className="min-w-0 opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
                    <p className="font-display text-sm tracking-[0.22em] text-sunrise">VH MEDIA</p>
                    <p className="line-clamp-1 text-sm text-muted">Research Tag and Title</p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2">
                ${cacMucDieuHuong.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return html`
                        <button
                            key=${item.id}
                            type="button"
                            onClick=${() => onSelect(item.id)}
                            className=${`flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${
                                isActive
                                    ? "bg-white text-ink shadow-panel"
                                    : "text-muted hover:bg-white/70 hover:text-ink"
                            }`}
                            title=${item.label}
                        >
                            <span className=${`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                isActive ? "bg-accent text-white shadow-float" : "bg-white/60 text-muted"
                            }`}>
                                <${Icon} className="h-5 w-5" strokeWidth=${2.1} />
                            </span>
                            <span className="min-w-0 whitespace-nowrap text-sm font-medium opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
                                ${item.label}
                            </span>
                        </button>
                    `;
                })}
            </nav>

            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-3 shadow-panel">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sunriseSoft text-sunrise">
                        <${BarChart3} className="h-5 w-5" />
                    </div>
                    <div className="opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
                        <p className="stat-label text-[10px] text-muted">Signals</p>
                        <p className="text-sm font-semibold text-ink">6 Rising Stars</p>
                    </div>
                </div>
            </div>
        </aside>
    `;
}
