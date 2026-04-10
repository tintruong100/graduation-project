"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import EmployeeMgmt from "@/components/dashboard/employees/EmployeeMgmt";

export default function EmployeesPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        document.title = "Quản lý Nhân viên | HRM System";
        const verifyAndLoad = () => {
            try {
                if (!isAuthenticated || !user) {
                    router.push("/login");
                    return;
                }
                if (user.role !== "ADMIN" && user.role !== "MANAGER") {
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EmployeeMgmt />
        </div>
    );
}