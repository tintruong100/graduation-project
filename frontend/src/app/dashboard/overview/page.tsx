import { type Metadata } from "next";
import OverviewDashboard from "@/components/dashboard/overview/OverviewDashboard";

export const metadata: Metadata = { title: "Tổng quan" };

export default function OverviewPage() {
    return <OverviewDashboard />;
}