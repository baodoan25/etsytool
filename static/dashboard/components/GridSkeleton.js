import { html } from "../utils/html.js";

function ChiSoKhungTai() {
    return html`
        <div className="rounded-[20px] border border-border bg-white px-4 py-3">
            <div className="skeleton-block mb-3 h-3 w-20 rounded-full"></div>
            <div className="skeleton-block h-7 w-16 rounded-xl"></div>
        </div>
    `;
}

export function LuoiKhungTai({ count = 6 }) {
    return html`
        <section className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5 pb-8">
            ${Array.from({ length: count }, (_, index) => html`
                <article key=${`grid-skeleton-${index}`} className="overflow-hidden rounded-[28px] border border-border bg-white shadow-panel">
                    <div className="border-b border-border bg-canvas/45 p-4">
                        <div className="skeleton-block h-[240px] w-full rounded-[24px]"></div>
                    </div>
                    <div className="p-5">
                        <div className="mb-4">
                            <div className="skeleton-block h-7 w-40 rounded-xl"></div>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="skeleton-block h-9 w-36 rounded-full"></div>
                                <div className="skeleton-block h-4 w-24 rounded-full"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <${ChiSoKhungTai} />
                            <${ChiSoKhungTai} />
                            <${ChiSoKhungTai} />
                            <${ChiSoKhungTai} />
                        </div>
                        <div className="mt-4 rounded-[22px] border border-border bg-accentSoft/55 px-4 py-4">
                            <div className="skeleton-block h-3 w-28 rounded-full"></div>
                            <div className="skeleton-block mt-3 h-8 w-24 rounded-xl"></div>
                        </div>
                    </div>
                </article>
            `)}
        </section>
    `;
}

export { LuoiKhungTai as GridSkeleton };
