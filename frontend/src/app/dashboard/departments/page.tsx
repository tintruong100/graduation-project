"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

// 1. Nhập đúng Component quản lý phòng ban
import DepartmentMgmt from "@/components/dashboard/departments/DepartmentMgmt";

export default function DepartmentsPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        document.title = "Quản lý Phòng ban | HRM System";

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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DepartmentMgmt />
        </div>
    );
}