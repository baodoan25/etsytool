import { useEffect, useRef, useState } from "react";
import { taiChiTietListing } from "../api/podResearchApi.js?v=20260418-normalizer-fix";

export function dungChiTietListing(listingSummary) {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const thamChieuMaYeuCau = useRef(0);

    useEffect(() => {
        if (!listingSummary?.listingId) {
            setDetails(null);
            setError("");
            setIsLoading(false);
            return undefined;
        }

        const boHuyYeuCau = new AbortController();
        const maYeuCauTiepTheo = thamChieuMaYeuCau.current + 1;
        thamChieuMaYeuCau.current = maYeuCauTiepTheo;

        setIsLoading(true);
        setError("");
        setDetails(null);

        taiChiTietListing(listingSummary.listingId, listingSummary, boHuyYeuCau.signal)
            .then((responseDetails) => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setDetails(responseDetails);
                setError("");
            })
            .catch((fetchError) => {
                if (boHuyYeuCau.signal.aborted || thamChieuMaYeuCau.current !== maYeuCauTiepTheo) {
                    return;
                }

                setDetails(null);
                setError(fetchError.message || "Unable to load listing details.");
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
    }, [listingSummary?.listingId, reloadKey]);

    return {
        details,
        isLoading,
        error,
        refetch: () => setReloadKey((current) => current + 1),
    };
}

export { dungChiTietListing as useListingDetails };
