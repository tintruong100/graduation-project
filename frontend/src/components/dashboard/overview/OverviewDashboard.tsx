"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBuilding, faFileCircleExclamation, faChartPie, faArrowRight, faUserPlus, faFingerprint } from '@fortawesome/free-solid-svg-icons';

interface DashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    males: number;
    females: number;
}

interface DeptStat {
    name: string;
    count: number;
    percentage: number;
}

export default function OverviewDashboard() {
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    // States lưu trữ số liệu thống kê
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeEmployees: 0,
        totalDepartments: 0,
        males: 0,
        females: 0,
    });
    const [deptStats, setDeptStats] = useState<DeptStat[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // 1. Lấy tên Admin từ Token
                const token = localStorage.getItem("token");
                if (token) {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(window.atob(base64));
                    setUserName(payload.full_name || "Admin");
                }

                // 2. Gọi API lấy dữ liệu thực tế
                const [empRes, deptRes] = await Promise.all([
                    fetchWithAuth("/employees"),
                    fetchWithAuth("/departments")
                ]);

                let employees = [];
                let departments = [];

                if (empRes.ok) employees = (await empRes.json()).data || [];
                if (deptRes.ok) departments = (await deptRes.json()).data || [];

                // 3. Xử lý số liệu
                const activeEmps = employees.filter((e: any) => String(e.is_active) === "true");
                const malesCount = employees.filter((e: any) => String(e.gender) === "true" || e.gender === 1).length;

                setStats({
                    totalEmployees: employees.length,
                    activeEmployees: activeEmps.length,
                    totalDepartments: departments.length,
                    males: malesCount,
                    females: employees.length - malesCount,
                });

                // 4. Tính toán phân bổ nhân sự
                const deptCountMap: Record<string, number> = {};
                employees.forEach((emp: any) => {
                    const deptName = emp.department?.name || "Chưa phân bổ";
                    deptCountMap[deptName] = (deptCountMap[deptName] || 0) + 1;
                });

                const deptArr = Object.keys(deptCountMap).map(key => ({
                    name: key,
                    count: deptCountMap[key],
                    percentage: employees.length > 0 ? Math.round((deptCountMap[key] / employees.length) * 100) : 0
                })).sort((a, b) => b.count - a.count).slice(0, 4);

                setDeptStats(deptArr);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
    );

    return (
        <div className="p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Lời chào */}
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                    Xin chào, {userName}! 👋
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Dưới đây là tổng quan tình hình nhân sự hôm nay.</p>
            </div>

            {/* Hàng 1: Thẻ Thống Kê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Thẻ 1: Nhân sự */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng Nhân Sự</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalEmployees}</h3>
                        <p className="text-xs text-green-600 font-semibold mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">
                            {stats.activeEmployees} đang làm việc
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                </div>

                {/* Thẻ 2: Phòng ban */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Phòng Ban</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalDepartments}</h3>
                        <p className="text-xs text-gray-500 font-semibold mt-2">Đang hoạt động</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                </div>

                {/* Thẻ 3: Tỷ lệ Giới tính */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="w-full">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Nam / Nữ</p>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">
                            {stats.males} <span className="text-gray-300 mx-1">/</span> {stats.females}
                        </h3>
                        <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-500" style={{ width: `${stats.totalEmployees ? (stats.males / stats.totalEmployees) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl ml-4">
                        <FontAwesomeIcon icon={faChartPie} />
                    </div>
                </div>

                {/* Thẻ 4: Đơn chờ duyệt */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Đơn Chờ Duyệt</p>
                        <h3 className="text-3xl font-black text-gray-800">5</h3>
                        <p className="text-xs text-orange-600 font-semibold mt-2 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            Cần xử lý ngay
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-2xl">
                        <FontAwesomeIcon icon={faFileCircleExclamation} />
                    </div>
                </div>
            </div>

            {/* Hàng 2: Nội dung chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột Trái */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Phân bổ nhân sự theo phòng ban</h3>
                        <Link href="/dashboard/departments" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Xem tất cả <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {deptStats.length === 0 ? (
                            <p className="text-center text-gray-400 py-4">Chưa có dữ liệu phòng ban</p>
                        ) : (
                            deptStats.map((dept, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-semibold text-gray-700">{dept.name}</span>
                                        <span className="text-sm font-bold text-gray-500">{dept.count} nhân viên ({dept.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${dept.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Cột Phải */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Truy cập nhanh</h3>
                    <div className="space-y-3">
                        <Link href="/dashboard/employees" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faUserPlus} /></div>
                            <div><h4 className="font-bold text-gray-800">Thêm nhân viên mới</h4><p className="text-xs text-gray-500">Quản lý hồ sơ nhân sự</p></div>
                        </Link>
                        <Link href="/dashboard/fingerprints" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faFingerprint} /></div>
                            <div><h4 className="font-bold text-gray-800">Đăng ký vân tay</h4><p className="text-xs text-gray-500">Lấy mẫu từ cảm biến AS608</p></div>
                        </Link>
                        <Link href="/dashboard/leave-ot" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faFileCircleExclamation} /></div>
                            <div><h4 className="font-bold text-gray-800">Duyệt đơn từ</h4><p className="text-xs text-gray-500">Nghỉ phép & Tăng ca</p></div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}