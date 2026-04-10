"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import ScanLog from "@/components/dashboard/scan-history/ScanLog";

export default function ScanHistoryPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        document.title = "Lịch sử quét | HRM System";
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
        <ScanLog />
    );
}