"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faChartPie, faUserPlus, faFingerprint,
    faFileCircleExclamation, faWifi, faUserClock, faUserCheck, faBuilding, faClipboardList
} from '@fortawesome/free-solid-svg-icons';

export default function OverviewDashboard() {
    // 1. Lấy tên Admin từ Zustand store
    const currentUser = useAuthStore.getState().user;
    const userName = currentUser?.full_name || "Admin";

    // 2. Gọi API lấy dữ liệu tổng hợp (Đã được cấu hình tự động làm mới mỗi 30s)
    const { data: summary, isLoading, isError } = useDashboardSummary();

    // 3. Xử lý trạng thái Loading
    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
    );

    if (isError || !summary) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
            Lỗi không thể tải dữ liệu Dashboard. Vui lòng thử lại.
        </div>
    );

    // Bóc tách dữ liệu từ API
    const { today, recent_scans, device_status } = summary;

    return (
        <div className="p-2 md:p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Lời chào */}
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                    Xin chào, {userName}! 👋
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Dưới đây là tổng quan tình hình nhân sự hôm nay.</p>
            </div>

            {/* Hàng 1: Thẻ Thống Kê (4 Thẻ Click được) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* Thẻ 1 (Tình hình đi làm) -> Bấm vào ra Báo cáo chấm công */}
                <Link href="/dashboard/attendance-report" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all cursor-pointer group">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-emerald-500 transition-colors">Đã Điểm Danh</p>
                        <h3 className="text-3xl font-black text-gray-800">{today.present + today.late}</h3>
                        <p className="text-xs text-orange-600 font-semibold mt-2 bg-orange-50 inline-block px-2 py-1 rounded-md">
                            Vắng: {today.absent} | Trễ: {today.late}
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faUserCheck} />
                    </div>
                </Link>

                {/* Thẻ 2 (Tổng Nhân Sự) -> Bấm vào ra Quản lý nhân viên */}
                <Link href="/dashboard/employees" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all cursor-pointer group">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Tổng Nhân Sự</p>
                        <h3 className="text-3xl font-black text-gray-800">{today.total}</h3>
                        <p className="text-xs text-green-600 font-semibold mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">
                            {today.active} đang làm việc
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                </Link>

                {/* Thẻ 3 (Phòng Ban) -> Bấm vào ra Quản lý phòng ban */}
                <Link href="/dashboard/departments" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:border-purple-200 transition-all cursor-pointer group">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-purple-500 transition-colors">Phòng Ban</p>
                        <h3 className="text-3xl font-black text-gray-800">{today.department_count}</h3>
                        <p className="text-xs text-gray-500 font-semibold mt-2">Đang hoạt động</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faBuilding} />
                    </div>
                </Link>

                {/* Thẻ 4 (Tỷ lệ Giới tính) -> Bấm vào ra Danh sách nhân viên */}
                <Link href="/dashboard/employees" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="w-full">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">Nam / Nữ</p>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">
                            {today.male_count} <span className="text-gray-300 mx-1">/</span> {today.female_count}
                        </h3>
                        <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${today.total ? (today.male_count / today.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl ml-4 shrink-0 group-hover:scale-110 transition-transform">
                        <FontAwesomeIcon icon={faChartPie} />
                    </div>
                </Link>

            </div>

            {/* Hàng 2: Nội dung chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột Trái (2/3): Lịch sử quét Live */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            Lịch sử quét gần nhất
                        </h3>
                        <Link href="/dashboard/scan-history" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Xem tất cả
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recent_scans?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 border-2 border-dashed rounded-xl">Chưa có dữ liệu quét nào hôm nay</p>
                        ) : (
                            recent_scans.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        {/* Hiển thị ảnh chụp từ Raspberry Pi */}
                                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                            {log.image_path ? (
                                                <img src={log.image_path} alt="scan" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FontAwesomeIcon icon={faUserClock} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">
                                                {log.employee?.full_name || "Người lạ (Chưa ĐK)"}
                                            </h4>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Mã NV: {log.employee?.employee_code || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm font-mono font-bold text-gray-700">
                                            {new Date(log.scan_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Cột Phải (1/3) */}
                <div className="flex flex-col gap-6">

                    {/* Trạng thái Pi (Dời từ trên xuống) */}
                    <div className={`rounded-2xl p-6 shadow-sm border flex items-center justify-between hover:shadow-md transition-all ${device_status.is_online ? 'bg-teal-50 border-teal-200' : 'bg-rose-50 border-rose-200'}`}>
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${device_status.is_online ? 'text-teal-600' : 'text-rose-600'}`}>
                                Máy Chấm Công
                            </p>
                            <h3 className={`text-3xl font-black ${device_status.is_online ? 'text-teal-700' : 'text-rose-700'}`}>
                                {device_status.is_online ? "ONLINE" : "OFFLINE"}
                            </h3>
                            <p className={`text-xs font-semibold mt-2 ${device_status.is_online ? 'text-teal-600' : 'text-rose-600'}`}>
                                {device_status.is_online
                                    ? 'Kết nối ổn định'
                                    : device_status.last_active
                                        ? `Rớt mạng từ: ${new Date(device_status.last_active).toLocaleString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}`
                                        : 'Chưa có tín hiệu'}
                            </p>
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${device_status.is_online ? 'bg-teal-100 text-teal-600 animate-pulse' : 'bg-rose-100 text-rose-600'}`}>
                            <FontAwesomeIcon icon={faWifi} />
                        </div>
                    </div>

                    {/* Truy cập nhanh */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Truy cập nhanh</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/employees" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faUserPlus} /></div>
                                <div><h4 className="font-bold text-gray-800">Thêm nhân viên mới</h4><p className="text-xs text-gray-500">Quản lý hồ sơ</p></div>
                            </Link>
                            <Link href="/dashboard/fingerprints" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faFingerprint} /></div>
                                <div><h4 className="font-bold text-gray-800">Đăng ký vân tay</h4><p className="text-xs text-gray-500">Cảm biến AS608</p></div>
                            </Link>
                            <Link href="/dashboard/attendance-report" className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faClipboardList} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Báo cáo chấm công</h4>
                                    <p className="text-xs text-gray-500">Xuất dữ liệu & Thống kê</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}