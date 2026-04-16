import { useEffect, useRef, useState } from "react";
import { fetchKeywordInsights } from "../api/podResearchApi.js";

export function useKeywordInsights(filters) {
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

        fetchKeywordInsights(filters, abortController.signal)
            .then((responseItems) => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setItems(responseItems);
            })
            .catch((fetchError) => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setItems([]);
                setError(fetchError.message || "Unable to load keyword insights.");
            })
            .finally(() => {
                if (abortController.signal.aborted || requestIdRef.current !== nextRequestId) {
                    return;
                }

                setIsLoading(false);
            });

        return () => abortController.abort();
    }, [filters.query, filters.timeframe, filters.sortBy, reloadKey]);

    return {
        items,
        isLoading,
        error,
        refetch: () => setReloadKey((current) => current + 1),
    };
}
