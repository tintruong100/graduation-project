"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup, faBuilding, faUser, faBars, faXmark, faMagnifyingGlassChart, faCalendarCheck, faClipboardUser, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State riêng cho mobile
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const getUser = async () => {
            try {
                const res = await fetchWithAuth("/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data);
                } else {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [router]);

    // Tự động đóng Mobile Menu khi chuyển trang
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-500 animate-pulse">Đang tải...</div>
            </div>
        );
    }

    const menuItems = [];

    // 1. THÔNG TIN CÁ NHÂN (Ai cũng thấy, để trên cùng)
    menuItems.push(
        { id: "profile", label: "Thông tin cá nhân", path: "/dashboard/profile", icon: <FontAwesomeIcon icon={faUser} /> }
    );

    // 2. DÀNH RIÊNG CHO ADMIN
    if (user?.role === "ADMIN") {
        menuItems.push(
            { id: "overview", label: "Tổng quan", path: "/dashboard/overview", icon: <FontAwesomeIcon icon={faMagnifyingGlassChart} /> },
            { id: "departments", label: "Phòng ban", path: "/dashboard/departments", icon: <FontAwesomeIcon icon={faBuilding} /> }
        );
    }

    // 3. DÀNH CHO ADMIN VÀ MANAGER 
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        menuItems.push(
            { id: "employees", label: "Nhân viên", path: "/dashboard/employees", icon: <FontAwesomeIcon icon={faPeopleGroup} /> }
        );
    }

    // 4. CÁC MỤC CHUNG AI CŨNG THẤY (Chấm công)
    menuItems.push(
        { id: "attendance-report", label: "Báo cáo chấm công", path: "/dashboard/attendance-report", icon: <FontAwesomeIcon icon={faClipboardUser} /> }
    );

    // 5. LỊCH SỬ QUÉT (Chỉ dành riêng cho ADMIN) - MỚI THÊM
    if (user?.role === "ADMIN") {
        menuItems.push(
            { id: "scan-history", label: "Lịch sử quét", path: "/dashboard/scan-history", icon: <FontAwesomeIcon icon={faClockRotateLeft} /> }
        );
    }

    // 5. MỤC NGHỈ PHÉP (Thay đổi tên gọi tùy theo quyền)
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        // Trưởng phòng & Admin thì hiển thị chữ "Quản lý Đơn từ"
        menuItems.push(
            { id: "leave-ot-manage", label: "Quản lý Đơn từ", path: "/dashboard/leave-ot", icon: <FontAwesomeIcon icon={faCalendarCheck} /> }
        );
    } else {
        // Nhân viên bình thường thì hiển thị chữ "Nghỉ phép & Tăng ca"
        menuItems.push(
            { id: "leave-ot-request", label: "Nghỉ phép & Tăng ca", path: "/dashboard/leave-ot", icon: <FontAwesomeIcon icon={faCalendarCheck} /> }
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* 1. Header Area */}
            <header className="flex-shrink-0 bg-white border-b border-gray-200 z-30">
                <div className="px-4 md:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Nút mở Sidebar trên Mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <FontAwesomeIcon icon={faBars} size="lg" />
                        </button>

                        {/* Tên hệ thống: HRM trên mobile, HRM System trên desktop */}
                        <h1 className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">
                            <span className="hidden md:inline">HRM System</span>
                            <span className="md:hidden">HRM</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-gray-800 font-semibold text-sm">{user?.full_name}</span>
                            <span className={`text-xs font-bold ${user?.role === 'ADMIN' ? 'text-red-700' : user?.role === 'MANAGER' ? 'text-blue-700' : 'text-gray-700'}`}>{user?.role}</span>
                        </div>
                        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm border border-red-200">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">

                {/* OVERLAY cho Mobile (Click ra ngoài để đóng) */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* 2. Sidebar Area */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    ${isSidebarOpen ? "md:w-64" : "md:w-20"}
                    flex flex-col border-r border-gray-200
                `}>
                    {/* Nút đóng Sidebar trên Mobile */}
                    <div className="flex items-center justify-between p-4 md:hidden border-b">
                        <span className="font-bold text-blue-600">Menu</span>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6">
                        <ul className="space-y-2 px-3">
                            {menuItems.map(item => {
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.path}
                                            className={`w-full flex items-center p-3 font-bold rounded-xl transition-all ${isActive
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                                } ${(!isSidebarOpen && !isMobileMenuOpen) && "md:justify-center"}`}
                                        >
                                            <span className={`text-xl ${(!isSidebarOpen && !isMobileMenuOpen) ? "md:mx-auto" : ""}`}>{item.icon}</span>
                                            {(isSidebarOpen || isMobileMenuOpen) && <span className="ml-4 truncate text-sm">{item.label}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Nút Thu gọn Desktop (Ẩn trên mobile) */}
                    <div className="hidden md:flex p-4 border-t border-gray-100 justify-end items-center bg-gray-50/50">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white border border-gray-300 hover:border-blue-500 rounded-lg shadow-sm">
                            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </button>
                    </div>
                </aside>

                {/* 3. Right Content Area (Children) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}