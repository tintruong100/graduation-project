"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPeopleGroup, faBuilding, faUser, faBars, faXmark,
    faMagnifyingGlassChart, faCalendarCheck, faClipboardUser,
    faClockRotateLeft, faFingerprint, faChevronLeft, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import UserProfile from "@/components/layout/UserProfile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const handleLogout = () => {
        storeLogout();
        document.cookie = "hrm-token=; path=/; max-age=0";
        router.push("/login");
    };

    if (!isAuthenticated) {
        return null;
    }

    const menuItems = [];
    if (user?.role === "ADMIN") {
        menuItems.push(
            { id: "overview", label: "Tổng quan", path: "/dashboard/overview", icon: faMagnifyingGlassChart },
        );
    }

    menuItems.push(
        { id: "profile", label: "Thông tin cá nhân", path: "/dashboard/profile", icon: faUser }
    );

    if (user?.role === "ADMIN") {
        menuItems.push(
            { id: "departments", label: "Phòng ban", path: "/dashboard/departments", icon: faBuilding }
        );
    }

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        menuItems.push(
            { id: "employees", label: "Nhân viên", path: "/dashboard/employees", icon: faPeopleGroup }
        );
    }

    if (user?.role === "ADMIN") {
        menuItems.push(
            { id: "fingerprints", label: "Vân tay", path: "/dashboard/fingerprints", icon: faFingerprint },
            { id: "scan-history", label: "Lịch sử quét", path: "/dashboard/scan-history", icon: faClockRotateLeft }
        );
    }

    menuItems.push(
        { id: "attendance-report", label: "Báo cáo chấm công", path: "/dashboard/attendance-report", icon: faClipboardUser }
    );

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        menuItems.push(
            { id: "leave-ot-manage", label: "Quản lý Đơn từ", path: "/dashboard/leave-ot", icon: faCalendarCheck }
        );
    } else {
        menuItems.push(
            { id: "leave-ot-request", label: "Nghỉ phép & Tăng ca", path: "/dashboard/leave-ot", icon: faCalendarCheck }
        );
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* ── Mobile overlay ── */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* ══════════════════════════════════════════════
                SIDEBAR
            ══════════════════════════════════════════════ */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex flex-col
                bg-white border-r border-gray-200 shadow-lg
                transform transition-all duration-300 ease-in-out
                md:relative md:translate-x-0 md:shadow-none
                ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
                ${isSidebarOpen ? "md:w-64" : "md:w-[72px]"}
            `}>
                {/* Sidebar header */}
                <div className={`
                    flex items-center border-b border-gray-100 flex-shrink-0
                    ${isSidebarOpen ? "px-5 py-4 gap-3 justify-between" : "px-0 py-4 justify-center"}
                    md:flex
                `}>
                    {/* Logo — hide text when collapsed */}
                    <div className={`flex items-center gap-2.5 ${!isSidebarOpen && "md:hidden"}`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-300 flex-shrink-0">
                            <span className="text-white text-xs font-black">HR</span>
                        </div>
                        <span className="font-black text-gray-800 tracking-tight text-base">HRM System</span>
                    </div>
                    {/* Collapsed logo icon */}
                    <div className={`hidden ${!isSidebarOpen && "md:flex"} items-center justify-center`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-300">
                            <span className="text-white text-xs font-black">HR</span>
                        </div>
                    </div>
                    {/* Close button on mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-1 text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <ul className="space-y-1">
                        {menuItems.map(item => {
                            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                            const collapsed = !isSidebarOpen && !isMobileMenuOpen;
                            return (
                                <li key={item.id}>
                                    <Link
                                        href={item.path}
                                        title={collapsed ? item.label : undefined}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            group flex items-center rounded-xl transition-all duration-200 font-medium text-sm
                                            ${collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"}
                                            ${isActive
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                                        `}
                                    >
                                        <FontAwesomeIcon
                                            icon={item.icon}
                                            className={`flex-shrink-0 text-base ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                                        />
                                        {!collapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                        {isActive && collapsed && (
                                            <span className="absolute left-[72px] bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Collapse toggle (desktop only) */}
                <div className="hidden md:flex p-3 border-t border-gray-100 justify-end">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title={isSidebarOpen ? "Thu gọn" : "Mở rộng"}
                    >
                        <FontAwesomeIcon icon={isSidebarOpen ? faChevronLeft : faChevronRight} className="text-sm" />
                    </button>
                </div>
            </aside>

            {/* ══════════════════════════════════════════════
                RIGHT SIDE  (Header + Main)
            ══════════════════════════════════════════════ */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                {/* ── HEADER ── */}
                <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200/80 z-30 sticky top-0">
                    <div className="px-4 md:px-6 h-14 flex items-center justify-between gap-4">
                        {/* Left: hamburger (mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Mở menu"
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </button>

                        {/* Page breadcrumb / title */}
                        <div className="flex-1 hidden md:block">
                            <p className="text-xs text-gray-400 font-medium">
                                {menuItems.find(m => pathname.startsWith(m.path))?.label ?? "Dashboard"}
                            </p>
                        </div>

                        {/* Right: user profile */}
                        <UserProfile userName={user?.full_name ?? ""} onLogout={handleLogout} />
                    </div>
                </header>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 overflow-y-auto bg-slate-100">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}