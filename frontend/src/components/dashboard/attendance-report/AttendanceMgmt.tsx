"use client";

import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch, faFileExcel, faFingerprint, faUserClock,
    faBuildingUser, faCheckCircle, faClock, faCircleExclamation, faCircleXmark, faArrowsRotate
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from "@/store/auth.store";
import { useDailyAttendanceAll, useMonthlyAttendance, useTriggerFinalize, useExportMonthlySummary } from "@/hooks/useAttendance";
import { useDepartments } from "@/hooks/useDepartments";
import { Table, type Column } from "@/components/ui/Table";
import type { AttendanceSummary, AuthUser } from "@/types";
import * as XLSX from 'xlsx';

// IMPORT THÊM ĐỂ GỌI API & BÁO LỖI CHO PHẦN XUẤT THÁNG
import toast from "react-hot-toast";

export default function AttendanceMgmt() {
    const currentUser = useAuthStore((state) => state.user) as AuthUser;
    const isAdmin = currentUser?.role === "ADMIN";
    const isManager = currentUser?.role === "MANAGER";
    const isEmployee = currentUser?.role === "EMPLOYEE";

    const defaultTab = isAdmin ? "COMPANY" : isManager ? "DEPARTMENT" : "PERSONAL";
    const [activeTab, setActiveTab] = useState<"COMPANY" | "DEPARTMENT" | "PERSONAL">(defaultTab);

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
    const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDept, setFilterDept] = useState("");

    const [yearStr, monthStr] = selectedMonth.split("-");
    const monthNum = parseInt(monthStr);
    const yearNum = parseInt(yearStr);

    const { data: dailyData = [], isLoading: dailyLoading, refetch: refetchDaily } = useDailyAttendanceAll(
        activeTab !== "PERSONAL" ? selectedDate : ""
    );

    const { data: monthlyData = [], isLoading: monthlyLoading, refetch: refetchMonthly } = useMonthlyAttendance(
        activeTab === "PERSONAL" ? currentUser?.id : "", monthNum, yearNum
    );

    const { data: departments = [] } = useDepartments();
    const triggerFinalize = useTriggerFinalize();

    const rawData = activeTab === "PERSONAL" ? monthlyData : dailyData;
    const isLoading = activeTab === "PERSONAL" ? monthlyLoading : dailyLoading;

    const filteredRecords = rawData.filter((record) => {
        if (activeTab === "DEPARTMENT" && isManager) {
            if (record.employee?.department?.id !== currentUser.department_id) return false;
        }
        if (activeTab === "COMPANY" && filterDept) {
            if (record.employee?.department?.id !== filterDept) return false;
        }
        if (searchTerm && activeTab !== "PERSONAL") {
            const searchLower = searchTerm.toLowerCase();
            const matchSearch =
                record.employee?.full_name?.toLowerCase().includes(searchLower) ||
                record.employee?.employee_code?.toLowerCase().includes(searchLower);
            if (!matchSearch) return false;
        }
        if (filterStatus && record.status !== filterStatus) return false;

        return true;
    });

    const renderStatus = (status: string, lateMins: number) => {
        switch (status) {
            case 'PRESENT': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faCheckCircle} /> Có mặt</span>;
            case 'LATE': return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faClock} /> Đi trễ ({lateMins}p)</span>;
            case 'MISSING_OUT': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faCircleExclamation} /> Thiếu giờ ra</span>;
            case 'ABSENT': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FontAwesomeIcon icon={faCircleXmark} /> Vắng mặt</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold w-fit">Chưa rõ</span>;
        }
    };

    const columns: Column<AttendanceSummary>[] = [];

    if (activeTab !== "PERSONAL") {
        columns.push({
            key: "employee",
            header: "Nhân viên",
            render: (_v: any, row: AttendanceSummary) => (
                <div>
                    <div className="font-bold text-gray-800">{row.employee?.full_name}</div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5">
                        {row.employee?.employee_code} • {row.employee?.department?.name || 'Chưa set'}
                    </div>
                </div>
            )
        });
    }

    columns.push(
        {
            key: "work_date", header: "Ngày", className: "text-center",
            render: (_v: any, row: AttendanceSummary) => <span className="font-semibold text-gray-700">{new Date(row.work_date).toLocaleDateString("vi-VN")}</span>
        },
        {
            key: "first_scan", header: "Giờ vào", className: "text-center",
            render: (_v: any, row: AttendanceSummary) => <span className="font-bold text-blue-700">{row.first_scan_time ? new Date(row.first_scan_time).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
        },
        {
            key: "last_scan", header: "Giờ ra", className: "text-center",
            render: (_v: any, row: AttendanceSummary) => <span className="font-bold text-purple-700">{row.last_scan_time ? new Date(row.last_scan_time).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
        },
        {
            key: "gross_hours", header: "Tổng giờ có mặt", className: "text-center",
            render: (_v: any, row: AttendanceSummary) => <span className="font-bold text-gray-700">{row.gross_work_hours ? `${row.gross_work_hours}h` : "-"}</span>
        },
        {
            key: "net_hours", header: "Tổng giờ công", className: "text-center",
            render: (_v: any, row: AttendanceSummary) => <span className="font-bold text-gray-700">{row.net_work_hours ? `${row.net_work_hours}h` : "-"}</span>
        },
        {
            key: "status", header: "Trạng thái",
            render: (_v: any, row: AttendanceSummary) => renderStatus(row.status, row.late_minutes)
        }
    );

    // 1. HÀM XUẤT EXCEL NGÀY (DÀN DỌC)
    const handleExportExcel = () => {
        if (filteredRecords.length === 0) {
            alert("Không có dữ liệu để xuất Excel!");
            return;
        }

        const exportData = filteredRecords.map((row, index) => {
            const statusMap: Record<string, string> = {
                PRESENT: "Có mặt",
                ABSENT: "Vắng mặt",
                LATE: `Đi trễ (${row.late_minutes} phút)`,
                MISSING_OUT: "Thiếu giờ ra",
            };

            if (activeTab === "PERSONAL") {
                return {
                    "STT": index + 1,
                    "Ngày làm việc": new Date(row.work_date).toLocaleDateString("vi-VN"),
                    "Giờ vào": row.first_scan_time ? new Date(row.first_scan_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
                    "Giờ ra": row.last_scan_time ? new Date(row.last_scan_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
                    "Công ròng (Giờ)": row.net_work_hours || 0,
                    "Trạng thái": statusMap[row.status] || "Chưa rõ",
                };
            } else {
                return {
                    "STT": index + 1,
                    "Mã NV": row.employee?.employee_code || "",
                    "Họ Tên": row.employee?.full_name || "",
                    "Phòng ban": row.employee?.department?.name || "Chưa set",
                    "Ngày làm việc": new Date(row.work_date).toLocaleDateString("vi-VN"),
                    "Giờ vào": row.first_scan_time ? new Date(row.first_scan_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
                    "Giờ ra": row.last_scan_time ? new Date(row.last_scan_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
                    "Công ròng (Giờ)": row.net_work_hours || 0,
                    "Trạng thái": statusMap[row.status] || "Chưa rõ",
                };
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoChamCong");

        const wscols = [
            { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        ];
        worksheet["!cols"] = wscols;

        const fileName = `ChamCong_${activeTab}_${activeTab === 'PERSONAL' ? selectedMonth : selectedDate}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // 1. Khai báo Hook
    const exportMonthlyMutation = useExportMonthlySummary();
    // 2. HÀM XUẤT EXCEL CHỐT THÁNG (DÀN NGANG)
    const handleExportMonthlySummary = async () => {
        try {
            toast.loading(`Đang tính toán dữ liệu công tháng ${monthNum}...`, { id: "export-month" });

            const res = await exportMonthlyMutation.mutateAsync({ month: monthNum, year: yearNum });
            const summaryData = res.data;

            if (!summaryData || summaryData.length === 0) {
                toast.error("Không có dữ liệu!", { id: "export-month" });
                return;
            }

            const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

            // 1. TẠO MẢNG ÉP THỨ TỰ CỘT (Khắc phục lỗi nhảy cột số lên đầu)
            const headerOrder = ["STT", "Mã NV", "Họ Tên", "Chức vụ", "Phòng ban"];
            for (let i = 1; i <= daysInMonth; i++) {
                headerOrder.push(`${i}`);
            }
            headerOrder.push("Tổng Công");

            const exportData = summaryData.map((emp, index) => {
                const rowData: any = {
                    "STT": index + 1,
                    "Mã NV": emp.employee_code,
                    "Họ Tên": emp.full_name,
                    "Chức vụ": emp.position,
                    "Phòng ban": emp.department,
                };

                for (let i = 1; i <= daysInMonth; i++) {
                    rowData[`${i}`] = emp.days?.[i] || "";
                }

                rowData["Tổng Công"] = emp.total_work_days || 0;
                return rowData;
            });

            // 2. TRUYỀN HEADER VÀO ĐÂY ĐỂ ÉP THỨ TỰ
            const worksheet = XLSX.utils.json_to_sheet(exportData, { header: headerOrder });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `T${monthNum}-${yearNum}`);

            const wscols = [
                { wch: 5 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
            ];
            for (let i = 1; i <= daysInMonth; i++) wscols.push({ wch: 4 });
            wscols.push({ wch: 10 });

            worksheet["!cols"] = wscols;

            XLSX.writeFile(workbook, `BangChamCong_Thang${monthNum}_${yearNum}.xlsx`);
            toast.success("Xuất bảng công thành công!", { id: "export-month" });

        } catch (error) {
            toast.error("Lỗi khi xuất Excel", { id: "export-month" });
        }
    };

    const handleRefresh = async () => {
        if (activeTab === "PERSONAL") {
            await refetchMonthly();
        } else {
            await refetchDaily();
        }

        toast.success("Dữ liệu đã được cập nhật mới nhất");
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">

            {!isEmployee && (
                <div className="flex border-b border-gray-200 mb-6 px-2">
                    {isAdmin && (
                        <button
                            onClick={() => { setActiveTab("COMPANY"); setSearchTerm(""); setFilterDept(""); }}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "COMPANY" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                        >
                            <FontAwesomeIcon icon={faBuildingUser} /> Toàn công ty
                        </button>
                    )}
                    {isManager && (
                        <button
                            onClick={() => { setActiveTab("DEPARTMENT"); setSearchTerm(""); setFilterDept(""); }}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "DEPARTMENT" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                        >
                            <FontAwesomeIcon icon={faBuildingUser} /> Phòng ban
                        </button>
                    )}
                    <button
                        onClick={() => { setActiveTab("PERSONAL"); setSearchTerm(""); setFilterDept(""); }}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "PERSONAL" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                        <FontAwesomeIcon icon={faUserClock} /> Của tôi
                    </button>
                </div>
            )}

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">

                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeTab === "PERSONAL" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                            <FontAwesomeIcon icon={activeTab === "PERSONAL" ? faUserClock : faFingerprint} size="lg" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                            {activeTab === "COMPANY" ? "Chấm công Toàn công ty" : activeTab === "DEPARTMENT" ? "Chấm công Phòng ban" : "Lịch sử Chấm công Cá nhân"}
                        </h2>
                    </div>

                    {/* CỤM CÔNG CỤ: CHỌN THỜI GIAN & CÁC NÚT XUẤT DỮ LIỆU */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">

                        {/* Input chọn Ngày hoặc Tháng */}
                        {activeTab === "PERSONAL" ? (
                            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" />
                        ) : (
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                        )}

                        {/* Nút Chốt sổ (Chỉ Admin thấy khi xem theo ngày) */}
                        {isAdmin && activeTab !== "PERSONAL" && (
                            <button
                                onClick={() => {
                                    if (confirm(`Chốt sổ điểm danh ngày ${selectedDate}?`)) triggerFinalize.mutate(selectedDate);
                                }}
                                disabled={triggerFinalize.isPending}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                {triggerFinalize.isPending ? "Đang xử lý..." : "Chốt sổ"}
                            </button>
                        )}

                        {/* NÚT 1: XUẤT EXCEL NGÀY */}
                        <button
                            onClick={handleExportExcel}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faFileExcel} /> Xuất ngày
                        </button>

                        {/* NÚT 2: CHỐT CÔNG THÁNG (Chỉ hiện cho Admin / Manager) */}
                        {!isEmployee && (
                            <button
                                onClick={handleExportMonthlySummary}
                                // SỬA Ở ĐÂY: Dùng .isPending của TanStack Query
                                disabled={exportMonthlyMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                {/* SỬA Ở ĐÂY TƯƠNG TỰ */}
                                {exportMonthlyMutation.isPending ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <><FontAwesomeIcon icon={faFileExcel} /> Chốt công tháng</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* CỤM THANH TÌM KIẾM VÀ LỌC */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                    {activeTab !== "PERSONAL" && (
                        <>
                            <div className="relative w-full sm:w-1/3">
                                <input type="text" placeholder="Tìm kiếm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                <span className="absolute left-3 top-2.5 text-gray-400"><FontAwesomeIcon icon={faSearch} /></span>
                            </div>

                            {activeTab === "COMPANY" && (
                                <select
                                    value={filterDept}
                                    onChange={(e) => setFilterDept(e.target.value)}
                                    className="w-full sm:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer text-sm font-medium text-gray-700"
                                >
                                    <option value="">Tất cả phòng ban</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`w-full sm:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none bg-white cursor-pointer text-sm font-medium text-gray-700 ${activeTab === "PERSONAL" ? "focus:ring-green-500" : "focus:ring-blue-500"}`}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PRESENT">Có mặt</option>
                        <option value="LATE">Đi trễ</option>
                        <option value="MISSING_OUT">Thiếu giờ ra</option>
                        <option value="ABSENT">Vắng mặt</option>
                    </select>

                    {/* NÚT LÀM MỚI Ở ĐÂY */}
                    <button
                        onClick={handleRefresh}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border border-gray-300 shadow-sm active:scale-95"
                    >
                        <FontAwesomeIcon
                            icon={faArrowsRotate}
                            className={`${isLoading ? "animate-spin" : ""}`}
                        />
                        Làm mới
                    </button>
                </div>
            </div>

            <Table<AttendanceSummary>
                data={filteredRecords}
                columns={columns}
                rowKey="id"
                isLoading={isLoading}
                emptyMessage={activeTab === "PERSONAL" ? "Không có dữ liệu tháng này" : "Không có dữ liệu trong ngày này"}
            />
        </div>
    );
}