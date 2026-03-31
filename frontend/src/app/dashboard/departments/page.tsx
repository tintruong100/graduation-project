"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";

// 1. Nhập đúng Component quản lý phòng ban
import DepartmentMgmt from "@/components/dashboard/departments/DepartmentMgmt";

export default function DepartmentsPage() {
    const router = useRouter();

    useEffect(() => {
        document.title = "Quản lý Phòng ban | HRM System";

        const verifyAndLoad = async () => {
            try {
                const res = await fetchWithAuth("/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    const user = data.data;
                    if (user.role !== "ADMIN") {
                        router.push("/dashboard/profile");
                        return;
                    }
                } else {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } catch (err) {
                console.error("Lỗi xác thực:", err);
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