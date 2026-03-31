"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ComingSoon from "@/components/coming-soon/ComingSoon";

export default function ScanHistoryPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Tổng quan | HRM System";
        const verifyAndLoad = () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                if (payload.role !== "ADMIN") {
                    router.push("/dashboard/profile");
                    return;
                }
            } catch (err) {
                console.error("Token không hợp lệ hoặc đã bị sửa đổi:", err);
                localStorage.removeItem("token");
                router.push("/login");
            }
        };
        verifyAndLoad();
    }, [router]);

    // 4. Chỉ render nội dung nếu là Admin
    return (
        <ComingSoon
            title="Lịch sử quét đang phát triển..."
            description="Các biểu đồ và thống kê lịch sử quét sẽ sớm có mặt tại đây!"
        />
    );
}