"use client";

import { useAuthStore } from "@/store/auth.store";
import Profile from "@/components/dashboard/profile/profile";
import type { AuthUser } from "@/types";

export default function ProfileClient() {
    const { user } = useAuthStore();
    // Profile page is only reachable when authenticated (proxy.ts + layout guard)
    const authUser = user as AuthUser | null;

    if (!authUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-gray-500 font-medium">Đang tải dữ liệu cá nhân...</div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
            <Profile user={authUser} />
        </div>
    );
}
