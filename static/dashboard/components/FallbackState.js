import { AlertTriangle, Inbox, RefreshCcw } from "lucide-react";
import { html } from "../utils/html.js";

const toneStyles = {
    empty: {
        iconWrap: "bg-accentSoft text-accent",
        action: "bg-accent text-white hover:bg-sunrise",
    },
    error: {
        iconWrap: "bg-dangerSoft text-danger",
        action: "bg-danger text-white hover:bg-[#bf3f3f]",
    },
};

export function TrangThaiDuPhong({
    tone = "empty",
    title,
    description,
    onRetry,
    actionLabel = "Try again",
}) {
    const Icon = tone === "error" ? AlertTriangle : Inbox;
    const styles = toneStyles[tone] || toneStyles.empty;

    return html`
        <div className="surface-panel flex min-h-[320px] items-center justify-center rounded-[32px] border border-dashed border-border px-8 py-12 text-center">
            <div className="max-w-[460px]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/70 bg-white shadow-panel">
                    <div className=${`flex h-14 w-14 items-center justify-center rounded-[22px] ${styles.iconWrap}`}>
                        <${Icon} className="h-7 w-7" />
                    </div>
                </div>
                <h3 className="mt-6 font-display text-3xl text-ink">${title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">${description}</p>
                ${onRetry ? html`
                    <button
                        type="button"
                        onClick=${onRetry}
                        className=${`mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${styles.action}`}
                    >
                        <${RefreshCcw} className="h-4 w-4" />
                        ${actionLabel}
                    </button>
                ` : null}
            </div>
        </div>
    `;
}

export { TrangThaiDuPhong as FallbackState };
