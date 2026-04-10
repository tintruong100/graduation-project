"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import Profile from "@/components/dashboard/profile/profile";

export default function ProfilePage() {
    const user = useCurrentUser();

    useEffect(() => {
        document.title = "Thông tin cá nhân | HRM System";
    }, []);

    if (!user) {
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