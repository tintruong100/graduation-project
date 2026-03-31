"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";

// 1. Nhập đúng Component quản lý phòng ban
import DepartmentMgmt from "@/components/dashboard/departments/DepartmentMgmt";

export default function DepartmentsPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Quản lý Phòng ban | HRM System";

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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DepartmentMgmt />
        </div>
    );
}