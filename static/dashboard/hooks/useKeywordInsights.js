import { useEffect, useRef, useState } from "react";
import { taiThongTinTuKhoa } from "../api/podResearchApi.js";

export function dungThongTinTuKhoa(filters) {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const thamChieuMaYeuCau = useRef(0);

    useEffect(() => {
        const boHuyYeuCau = new AbortController();
        const maYeuCauTiepTheo = thamChieuMaYeuCau.current + 1;
        thamChieuMaYeuCau.current = maYeuCauTiepTheo;

        setIsLoading(true);
        setError("");

        taiThongTinTuKhoa(filters, boHuyYeuCau.signal)
            .then((payload) => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setItems(payload.items || []);
                setMeta(payload.meta || {});
            })
            .catch((fetchError) => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setItems([]);
                setMeta({});
                setError(fetchError.message || "Unable to load keyword insights.");
            })
            .finally(() => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setIsLoading(false);
            });

        return () => boHuyYeuCau.abort();
    }, [filters.query, filters.timeframe, filters.sortBy, reloadKey]);

    return {
        items,
        meta,
        isLoading,
        error,
        refetch: () => setReloadKey((current) => current + 1),
    };
}
