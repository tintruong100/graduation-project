import { type Metadata } from "next";
import FingerprintMgmt from "@/components/dashboard/fingerprint/FingerprintMgmt";

export const metadata: Metadata = { title: "Vân tay" };

export default function FingerprintPage() {
    return <FingerprintMgmt />;
}