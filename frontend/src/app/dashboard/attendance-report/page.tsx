"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ComingSoon from "@/components/coming-soon/ComingSoon";

export default function AttendanceReportPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Báo cáo chấm công | HRM System";
    }, [router]);

    return (
        <ComingSoon
            title="Báo cáo chấm công đang phát triển..."
            description="Hệ thống tổng hợp dữ liệu chấm công sẽ sớm có mặt tại đây!"
        />
    );
}