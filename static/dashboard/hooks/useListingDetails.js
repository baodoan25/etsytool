import { useEffect, useRef, useState } from "react";
import { fetchListingDetails } from "../api/podResearchApi.js";

export function useListingDetails(listingSummary) {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!listingSummary?.listingId) {
            setDetails(null);
            setError("");
            setIsLoading(false);
            return undefined;
        }

        const abortController = new AbortController();
        const nextRequestId = requestIdRef.current + 1;
        requestIdRef.current = nextRequestId;

        setIsLoading(true);
        setError("");
        setDetails(null);

        fetchListingDetails(listingSummary.listingId, listingSummary, abortController.signal)
            .then((responseDetails) => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setDetails(responseDetails);
                setError("");
            })
            .catch((fetchError) => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setDetails(null);
                setError(fetchError.message || "Unable to load listing details.");
            })
            .finally(() => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setIsLoading(false);
            });

        return () => {
            abortController.abort();
        };
    }, [listingSummary?.listingId, reloadKey]);

    return {
        details,
        isLoading,
        error,
        refetch: () => setReloadKey((current) => current + 1),
    };
}
