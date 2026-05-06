import { type Metadata } from "next";
import SecurityAlert from "@/components/dashboard/security-alert/SecurityAlert";

export const metadata: Metadata = { title: "Cảnh báo an ninh" };

export default function SecurityAlertPage() {
    return <SecurityAlert />;
}