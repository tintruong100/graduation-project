"use client";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrashCan, faHistory, faClock, faUser, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import { useScanLogs, useDeleteScanLog } from "@/hooks/useScanLogs";
import type { ScanLog } from "@/types";

export default function ScanHistoryMgmt() {
    const { data: scanLogs = [], isLoading: loading } = useScanLogs();
    const deleteScanLog = useDeleteScanLog();

    const [searchTerm, setSearchTerm] = useState("");

    // States cho modal XEM CHI TIẾT
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<ScanLog | null>(null);

    // CHÚ Ý: Cập nhật biến này thành địa chỉ Backend của bạn
    const BACKEND_URL = "http://192.168.0.134:8001";

    const handleDelete = (id: string) => {
        if (!confirm("Bạn có chắc muốn xoá dữ liệu lịch sử này?")) return;
        deleteScanLog.mutate(id);
    };

    const openViewModal = (log: ScanLog) => {
        setViewData(log);
        setIsViewModalOpen(true);
    };

    const filteredData = scanLogs.filter((log) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesEmpName = log.employee?.full_name?.toLowerCase().includes(searchLower);
        const matchesEmpCode = log.employee?.employee_code?.toLowerCase().includes(searchLower);
        return matchesEmpName || matchesEmpCode;
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Chưa có thông tin";
        try {
            return new Date(dateStr).toLocaleString("vi-VN");
        } catch {
            return dateStr;
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu lịch sử quét...</div>;

    return (
        <div className="p-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 mr-4">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FontAwesomeIcon icon={faHistory} size="lg" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Lịch sử Quét & Chấm công</h3>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Tìm theo tên NV, mã NV..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">STT</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Nhân Viên</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Thời gian quét</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu phù hợp</td>
                            </tr>
                        ) : (
                            filteredData.map((log, index) => (
                                <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                                    <td className="p-4 text-sm">
                                        {log.status === 'SUCCESS' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">HỢP LỆ</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">THẤT BẠI</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-gray-800">
                                            {log.employee?.full_name || <span className="text-red-500">Người lạ (Chưa ĐK)</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">{log.employee?.employee_code || "N/A"}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700 font-medium">
                                        <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                                        {formatDate(log.scan_time)}
                                    </td>
                                    <td className="p-4 text-sm text-center space-x-5">
                                        <button onClick={() => openViewModal(log)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all" title="Xem chi tiết">
                                            <FontAwesomeIcon icon={faEye} size="lg" />
                                        </button>

                                        <button onClick={() => handleDelete(log.id)} className="text-red-500 hover:text-red-700 hover:scale-110 transition-all" title="Xóa dữ liệu">
                                            <FontAwesomeIcon icon={faTrashCan} size="lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL XEM CHI TIẾT */}
            {/* KHÔI PHỤC LẠI: MODAL XEM CHI TIẾT THEO CHUẨN ĐỒNG BỘ */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">Chi tiết Lịch sử quét</h2>
                            <div className="space-y-4">

                                {/* Dòng 1: Nhân viên */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Nhân viên:</span>
                                    <span className="col-span-2 text-gray-800 font-bold">
                                        {viewData.employee?.full_name || <span className="text-red-500">Người lạ (Chưa ĐK)</span>}
                                        {viewData.employee?.employee_code ? ` (${viewData.employee.employee_code})` : ""}
                                    </span>
                                </div>

                                {/* Dòng 2: Thời gian quét */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Thời gian quét:</span>
                                    <span className="col-span-2 text-gray-800 font-semibold">{formatDate(viewData.scan_time)}</span>
                                </div>

                                {/* Dòng 3: Trạng thái (Thêm vào cho rõ ràng) */}
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Trạng thái:</span>
                                    <span className="col-span-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${viewData.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {viewData.status === 'SUCCESS' ? 'HỢP LỆ' : 'THẤT BẠI'}
                                        </span>
                                    </span>
                                </div>

                                {/* Dòng 4: Hình ảnh (Thiết kế dạng khối giống textarea) */}
                                <div className="flex flex-col border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 font-medium mb-3">Hình ảnh chụp lại:</span>
                                    <div className="w-full min-h-[200px] border border-gray-200 bg-gray-50 rounded p-2 flex items-center justify-center">
                                        {viewData.image_path ? (
                                            <img
                                                // Nếu url đã có http thì dùng luôn, chưa có thì ghép với domain backend
                                                src={viewData.image_path.startsWith('http') ? viewData.image_path : `http://localhost:8000${viewData.image_path}`}
                                                alt="Ảnh chấm công"
                                                className="max-w-full h-auto max-h-[280px] object-contain rounded shadow-sm"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Loi+Hien+Thi+Anh';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">Không có dữ liệu ảnh</span>
                                        )}
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