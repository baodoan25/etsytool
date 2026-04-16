import { useEffect, useRef, useState } from "react";
import { fetchTopListings } from "../api/podResearchApi.js";

export function useFetchTopListings(filters) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const abortController = new AbortController();
        const nextRequestId = requestIdRef.current + 1;
        requestIdRef.current = nextRequestId;

        setIsLoading(true);
        setError("");
        setItems([]);

        fetchTopListings(filters, abortController.signal)
            .then((responseItems) => {
                if (requestIdRef.current !== nextRequestId) {
                    return;
                }

                setItems(responseItems);
                setError("");
            })
            .catch((fetchError) => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setItems([]);
                setError(fetchError.message || "Unable to load top listings.");
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
