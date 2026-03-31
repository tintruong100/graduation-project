"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ComingSoon from "@/components/coming-soon/ComingSoon";

export default function LeaveOTPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Nghỉ phép và tăng ca | HRM System";
    }, [router]);

    return (
        <ComingSoon
            title="Quản lý nghỉ phép và tăng ca đang phát triển..."
            description="Hệ thống đăng kí nghỉ phép và tăng ca sẽ sớm có mặt tại đây!"
        />
    );
}