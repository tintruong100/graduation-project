"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FingerprintMgmt from "@/components/dashboard/fingerprint/FingerprintMgmt";

export default function FingerprintPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Vân tay | HRM System";
    }, [router]);

    return (
        <FingerprintMgmt />
    );
}