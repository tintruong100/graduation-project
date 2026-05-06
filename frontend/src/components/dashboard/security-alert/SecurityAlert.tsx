"use client";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faHistory, faClock, faArrowsRotate, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useSecurityAlerts } from "@/hooks/useSecurityAlert";
import type { SecurityAlert } from "@/types";
import { Table, type Column } from "@/components/ui/Table";

// IMPORT THÊM TOAST ĐỂ THÔNG BÁO LÀM MỚI
import toast from "react-hot-toast";

export default function SecurityAlertMgmt() {
    // 1. LẤY THÊM HÀM refetch TỪ HOOK
    const { data: alerts = [], isLoading: loading, refetch } = useSecurityAlerts();

    const [searchTerm, setSearchTerm] = useState("");

    // States cho modal XEM CHI TIẾT
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<SecurityAlert | null>(null);

    // 2. HÀM XỬ LÝ LÀM MỚI DỮ LIỆU
    const handleRefresh = async () => {
        setSearchTerm(""); // Xóa thanh tìm kiếm
        await refetch();   // Ép tải lại dữ liệu từ Server
        toast.success("Đã làm mới dữ liệu cảnh báo an ninh!");
    };

    const openViewModal = (alert: SecurityAlert) => {
        setViewData(alert);
        setIsViewModalOpen(true);
    };

    const filteredData = alerts.filter((alert) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesMessage = alert.message?.toLowerCase().includes(searchLower);
        const matchesDevice = alert.device_id?.toLowerCase().includes(searchLower);
        return matchesMessage || matchesDevice;
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Chưa có thông tin";
        try {
            return new Date(dateStr).toLocaleString("vi-VN");
        } catch {
            return dateStr;
        }
    };

    // HÀM DỊCH LOẠI CẢNH BÁO SANG TIẾNG VIỆT
    const translateAlertType = (type?: string) => {
        switch (type) {
            case "INTRUDER_DETECTED":
                return "PHÁT HIỆN ĐỘT NHẬP";
            case "SYSTEM_ERROR":
                return "LỖI HỆ THỐNG";
            case "DEVICE_OFFLINE":
                return "MẤT KẾT NỐI";
            default:
                return type || "CHƯA XÁC ĐỊNH";
        }
    };

    if (loading && alerts.length === 0) return null; // loading.tsx handles skeleton

    const alertColumns: Column<SecurityAlert>[] = [
        {
            key: "index",
            header: "STT",
            className: "w-14",
            render: (_v, _r, index) => <span className="text-gray-500">{index + 1}</span>,
        },
        {
            key: "device_id",
            header: "Thiết bị",
            render: (_v, alert) => (
                <div className="text-sm font-semibold text-gray-800">
                    {alert.device_id || "Không rõ thiết bị"}
                </div>
            ),
        },
        {
            key: "alert_type",
            header: "Loại cảnh báo",
            render: (_v, alert) => (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                    {translateAlertType(alert.alert_type)}
                </span>
            ),
        },
        {
            key: "created_at",
            header: "Thời gian phát hiện",
            render: (_v, alert) => (
                <span className="text-gray-700 font-medium">
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                    {formatDate(alert.created_at)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Thao tác",
            className: "text-center",
            render: (_v, alert) => (
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openViewModal(alert)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} size="lg" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 mr-4">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Cảnh báo An ninh</h3>
                    </div>

                    {/* THANH TÌM KIẾM */}
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Tìm theo thiết bị, nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* 3. NÚT LÀM MỚI */}
                    <button
                        onClick={handleRefresh}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border border-gray-300 shadow-sm active:scale-95"
                        title="Xóa bộ lọc và làm mới dữ liệu"
                    >
                        <FontAwesomeIcon
                            icon={faArrowsRotate}
                            className={`${loading ? "animate-spin" : ""}`}
                        />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <Table<SecurityAlert>
                data={filteredData}
                columns={alertColumns}
                rowKey="id"
                emptyMessage="Không tìm thấy dữ liệu phù hợp"
                defaultPageSize={25}
            />

            {/* MODAL XEM CHI TIẾT */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">Chi tiết Cảnh báo</h2>
                            <div className="space-y-4">

                                {/* Dòng 1: Thiết bị */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Thiết bị báo cáo:</span>
                                    <span className="col-span-2 text-gray-800 font-bold">
                                        {viewData.device_id || <span className="text-red-500">Không rõ</span>}
                                    </span>
                                </div>

                                {/* Dòng 2: Thời gian quét */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Thời gian ghi nhận:</span>
                                    <span className="col-span-2 text-gray-800 font-semibold">{formatDate(viewData.created_at)}</span>
                                </div>

                                {/* Dòng 3: Loại cảnh báo */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Loại cảnh báo:</span>
                                    <span className="col-span-2">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700">
                                            {translateAlertType(viewData.alert_type)}
                                        </span>
                                    </span>
                                </div>

                                {/* Dòng 4: Nội dung */}
                                <div className="flex flex-col border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 font-medium mb-3">Nội dung cảnh báo:</span>
                                    <div className="w-full min-h-[100px] border border-gray-200 bg-gray-50 rounded p-4 flex items-start justify-start">
                                        <span className="text-red-600 font-medium">{viewData.message}</span>
                                    </div>
                                </div>

                            </div>

                            {/* Nút Đóng */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}