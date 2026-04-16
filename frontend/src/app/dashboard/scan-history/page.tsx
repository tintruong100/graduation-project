import { type Metadata } from "next";
import ScanLog from "@/components/dashboard/scan-history/ScanLog";

export const metadata: Metadata = { title: "Lịch sử quét" };

export default function ScanHistoryPage() {
    return <ScanLog />;
}