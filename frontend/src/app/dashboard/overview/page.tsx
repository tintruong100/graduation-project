"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import OverviewDashboard from "@/components/dashboard/overview/OverviewDashboard";

export default function OverviewPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        document.title = "Tổng quan | HRM System";
        const verifyAndLoad = () => {
            try {
                if (!isAuthenticated || !user) {
                    router.push("/login");
                    return;
                }
                if (user.role !== "ADMIN") {
                    router.push("/dashboard/profile");
                    return;
                }
            } catch (err) {
                console.error("Không thể xác thực quyền truy cập:", err);
                storeLogout();
                router.push("/login");
            }
        };
        verifyAndLoad();
    }, [router, user, isAuthenticated, storeLogout]);

    // 4. Chỉ render nội dung nếu là Admin
    return (
        <OverviewDashboard />
    );
}