import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetch/client";
import { SecurityAlert } from "@/types";

export const securityAlertKeys = {
    all: ["security-alerts"] as const,
    lists: () => [...securityAlertKeys.all, "list"] as const,
};

export function useSecurityAlerts() {
    return useQuery({
        queryKey: securityAlertKeys.lists(),
        queryFn: () => fetchClient.get<SecurityAlert[]>("/security-alerts"),
        select: (res) => res.data ?? [],
    });
}