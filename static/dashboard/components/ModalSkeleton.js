import { html } from "../utils/html.js";

function TagPlaceholder({ index }) {
    return html`
        <div key=${`tag-placeholder-${index}`} className="rounded-[22px] border border-border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="skeleton-block h-10 w-2 rounded-full"></div>
                <div className="min-w-0 flex-1">
                    <div className="skeleton-block h-4 w-28 rounded-full"></div>
                    <div className="mt-3 flex gap-2">
                        <div className="skeleton-block h-2 w-12 rounded-full"></div>
                        <div className="skeleton-block h-2 w-8 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function ModalSkeleton() {
    return html`
        <div className="surface-panel app-scrollbar relative grid h-[calc(100vh-80px)] w-[min(1220px,calc(100vw-120px))] grid-cols-[420px_minmax(0,1fr)] overflow-hidden rounded-[36px]">
            <section className="app-scrollbar overflow-y-auto border-r border-border bg-canvas/65 p-8">
                <div className="skeleton-block h-[320px] w-full rounded-[28px]"></div>
                <div className="mt-6">
                    <div className="flex gap-2">
                        <div className="skeleton-block h-7 w-24 rounded-full"></div>
                        <div className="skeleton-block h-7 w-28 rounded-full"></div>
                    </div>
                    <div className="skeleton-block mt-4 h-10 w-[85%] rounded-2xl"></div>
                    <div className="skeleton-block mt-3 h-4 w-[62%] rounded-full"></div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="skeleton-block h-[90px] rounded-[22px]"></div>
                        <div className="skeleton-block h-[90px] rounded-[22px]"></div>
                        <div className="skeleton-block h-[90px] rounded-[22px]"></div>
                        <div className="skeleton-block h-[90px] rounded-[22px]"></div>
                    </div>
                </div>
            </section>
            <section className="app-scrollbar overflow-y-auto p-8">
                <div className="skeleton-block h-9 w-48 rounded-xl"></div>
                <div className="skeleton-block mt-3 h-4 w-[68%] rounded-full"></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    ${Array.from({ length: 13 }, (_, index) => html`<${TagPlaceholder} index=${index} />`)}
                </div>
            </section>
        </div>
    `;
}
