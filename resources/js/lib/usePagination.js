import { useState, useMemo } from "react";

export function usePagination(data, perPage = 12) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(data.length / perPage));

    const paginated = useMemo(() => {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    }, [data, page, perPage]);

    const goTo = (p) => {
        const clamped = Math.max(1, Math.min(p, totalPages));
        setPage(clamped);
    };

    return { paginated, page, goTo, totalPages };
}
