"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";

// Import cái component giao diện cũ của bạn vào đây
import Profile from "@/components/dashboard/profile/profile";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Cập nhật thẻ Title của trình duyệt
        document.title = "Thông tin cá nhân | HRM System";

        // 2. Lấy thông tin user cho trang này
        const getUserInfo = async () => {
            try {
                const res = await fetchWithAuth("/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data);
                } else {
                    router.push("/login");
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin user:", err);
            } finally {
                setLoading(false);
            }
        };

        getUserInfo();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-gray-500 font-medium">Đang tải dữ liệu cá nhân...</div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
            <Profile user={user} />
        </div>
    );
}