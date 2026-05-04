// src/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetch/client";
import type { DashboardSummary } from "@/types";

// Khai báo Query Keys chuẩn chỉnh giống style của bạn
export const dashboardKeys = {
    all: ["dashboard"] as const,
    summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboardSummary() {
    return useQuery({
        queryKey: dashboardKeys.summary(),
        queryFn: () => fetchClient.get<DashboardSummary>("/dashboard/summary"),
        select: (res) => res.data,
        refetchInterval: 30000,
        staleTime: 10000,
    });
}