"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";

import EmployeeMgmt from "@/components/dashboard/employees/EmployeeMgmt";

export default function EmployeesPage() {
    const router = useRouter();

    useEffect(() => {
        // 2. Đổi tiêu đề phù hợp
        document.title = "Quản lý Nhân viên | HRM System";
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

    // 4. Chỉ render nội dung nếu là Admin
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EmployeeMgmt />
        </div>
    );
}