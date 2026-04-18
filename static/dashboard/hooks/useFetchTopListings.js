import { useEffect, useRef, useState } from "react";
import { taiListingHangDau } from "../api/podResearchApi.js?v=20260418-normalizer-fix";

export function dungTaiListingHangDau(filters) {
    const [items, setItems] = useState([]);
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
        setItems([]);

        taiListingHangDau(filters, boHuyYeuCau.signal)
            .then((responseItems) => {
                if (thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setItems(responseItems);
                setError("");
            })
            .catch((fetchError) => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setItems([]);
                setError(fetchError.message || "Unable to load top listings.");
            })
            .finally(() => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setIsLoading(false);
            });

        return () => {
            boHuyYeuCau.abort();
        };
    }, [
        filters.date,
        filters.searchMode,
        filters.searchQuery,
        filters.createdTime,
        filters.category,
        filters.timeframe,
        filters.sortBy,
        filters.potentialOnly,
        reloadKey,
    ]);

    return {
        items,
        isLoading,
        error,
        refetch: () => setReloadKey((current) => current + 1),
    };
}

export { dungTaiListingHangDau as useFetchTopListings };
