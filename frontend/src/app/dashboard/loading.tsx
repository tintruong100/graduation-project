import { TableSkeleton } from "@/components/ui/Loading";

/**
 * Dashboard loading — shown in <main> while any dashboard page is loading/transitioning.
 * Next.js App Router automatically wraps <children> in a Suspense boundary and
 * renders this file during page navigation.
 */
export default function DashboardLoading() {
    return (
        <div className="animate-in fade-in duration-200 space-y-6">
            {/* Placeholder header row */}
            <div className="flex items-center justify-between">
                <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Table skeleton as the main content placeholder */}
            <TableSkeleton rows={7} cols={5} />
        </div>
    );
}
