"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan, faFingerprint } from '@fortawesome/free-solid-svg-icons';

interface Fingerprint {
    id: string;
    employee_id: string;
    finger_name: string;
    sensor_id: number;
    template_data?: string;
    is_active: boolean;
    createdAt?: string;
    employee?: {
        id: string;
        full_name: string;
        employee_code: string;
    };
}

interface Employee {
    id: string;
    full_name: string;
    employee_code: string;
}

export default function FingerprintMgmt() {
    const [fingerprints, setFingerprints] = useState<Fingerprint[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // States cho modal XEM CHI TIẾT
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData] = useState<Fingerprint | null>(null);

    const [formData, setFormData] = useState({
        id: "",
        employee_id: "",
        finger_name: "",
        sensor_id: "",
        template_data: "",
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [fingerRes, empRes] = await Promise.all([
                fetchWithAuth("/fingerprints"),
                fetchWithAuth("/employees")
            ]);

            if (fingerRes.ok) {
                const body = await fingerRes.json();
                setFingerprints(body.data || []);
            }
            if (empRes.ok) {
                const body = await empRes.json();
                setEmployees(body.data || []);
            }
        } catch (e) {
            console.error("Lỗi tải dữ liệu:", e);
            setFingerprints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xoá dữ liệu vân tay này?")) return;
        try {
            const res = await fetchWithAuth(`/fingerprints/${id}`, { method: "DELETE" });
            if (res.ok) {
                loadData();
            } else {
                alert("Có lỗi xảy ra khi xoá.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({
            id: "",
            employee_id: "",
            finger_name: "",
            sensor_id: "",
            template_data: "",
        });
        setIsModalOpen(true);
    };

    const openEditModal = (fp: Fingerprint) => {
        setIsEdit(true);
        setFormData({
            id: fp.id,
            employee_id: fp.employee_id,
            finger_name: fp.finger_name,
            sensor_id: String(fp.sensor_id),
            template_data: fp.template_data || "",
        });
        setIsModalOpen(true);
    };

    const openViewModal = (fp: Fingerprint) => {
        setViewData(fp);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            try {
                const res = await fetchWithAuth(`/fingerprints/${formData.id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        finger_name: formData.finger_name,
                    }),
                });
                const body = await res.json();
                if (res.ok) {
                    alert("Cập nhật thông tin thành công!");
                    setIsModalOpen(false);
                    loadData();
                } else {
                    alert(body.message || "Lỗi cập nhật!");
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi kết nối.");
            }
        } else {
            // LUỒNG TẠO MỚI (QUÉT VÀ LƯU)
            setIsScanning(true);
            try {
                const res = await fetchWithAuth(`/fingerprints`, {
                    method: "POST",
                    body: JSON.stringify({
                        employee_id: formData.employee_id,
                        finger_name: formData.finger_name,
                    }),
                });

                const body = await res.json();
                if (res.ok) {
                    alert("Đăng ký vân tay thành công!");
                    setIsModalOpen(false);
                    loadData();
                } else {
                    alert(body.message + "\n" + body.error || "Quá trình quét thất bại hoặc hết thời gian chờ!");
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi kết nối tới thiết bị quét.");
            } finally {
                setIsScanning(false);
            }
        }
    };

    const filteredData = fingerprints.filter((fp) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesEmpName = fp.employee?.full_name?.toLowerCase().includes(searchLower);
        const matchesEmpCode = fp.employee?.employee_code?.toLowerCase().includes(searchLower);
        const matchesFinger = fp.finger_name?.toLowerCase().includes(searchLower);

        return matchesEmpName || matchesEmpCode || matchesFinger;
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Chưa có thông tin";
        try {
            return new Date(dateStr).toLocaleString("vi-VN");
        } catch {
            return dateStr;
        }
    };

    if (loading) return <div className="py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu vân tay...</div>;

    return (
        <div className="p-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-3 mr-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FontAwesomeIcon icon={faFingerprint} size="lg" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Quản lý Vân tay</h3>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Tìm theo tên NV, mã NV, ngón tay..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95 w-full md:w-auto">
                    + Đăng ký vân tay mới
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">STT</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Mã NV</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Nhân Viên</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Ngón tay</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">ID Cảm biến (AS608)</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu phù hợp</td>
                            </tr>
                        ) : (
                            filteredData.map((fp, index) => (
                                <tr key={fp.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                                    <td className="p-4 text-sm font-mono text-blue-600">{fp.employee?.employee_code || "N/A"}</td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-gray-800">{fp.employee?.full_name || "Nhân viên đã xóa"}</div>
                                        <div className="text-xs text-gray-500">Ngày tạo: {formatDate(fp.createdAt)}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">{fp.finger_name}</td>
                                    <td className="p-4 text-sm">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-mono font-semibold">
                                            #{fp.sensor_id}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-center space-x-5">
                                        <button onClick={() => openViewModal(fp)} className="text-green-500 hover:text-green-700 hover:scale-110 transition-all" title="Xem chi tiết">
                                            <FontAwesomeIcon icon={faEye} size="lg" />
                                        </button>
                                        <button onClick={() => openEditModal(fp)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all" title="Chỉnh sửa">
                                            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                                        </button>
                                        <button onClick={() => handleDelete(fp.id)} className="text-red-500 hover:text-red-700 hover:scale-110 transition-all" title="Xóa dữ liệu">
                                            <FontAwesomeIcon icon={faTrashCan} size="lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* KHÔI PHỤC LẠI: MODAL XEM CHI TIẾT */}
            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">Chi tiết Vân tay</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Nhân viên:</span>
                                    <span className="col-span-2 text-gray-800 font-bold">{viewData.employee?.full_name} ({viewData.employee?.employee_code})</span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">Ngón tay:</span>
                                    <span className="col-span-2 text-gray-800 font-semibold">{viewData.finger_name}</span>
                                </div>
                                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                                    <span className="text-gray-500 font-medium">ID AS608:</span>
                                    <span className="col-span-2 text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded inline-block w-max">#{viewData.sensor_id}</span>
                                </div>
                                <div className="flex flex-col border-b border-gray-100 pb-3">
                                    <span className="text-gray-500 font-medium mb-2">Mã HEX (Template Data):</span>
                                    <textarea
                                        readOnly
                                        value={viewData.template_data || "Không có dữ liệu sao lưu"}
                                        className="w-full h-24 text-xs font-mono p-2 border border-gray-200 bg-gray-50 rounded outline-none resize-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setIsViewModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-all">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÊM / SỬA MỚI (Đã gộp nút Quét & Lưu) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{isEdit ? "Cập nhật dữ liệu" : "Đăng ký Vân tay"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Chọn Nhân viên */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nhân viên sở hữu</label>
                                    <select
                                        required
                                        value={formData.employee_id}
                                        onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                        disabled={isEdit}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${isEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.employee_code} - {emp.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tên Ngón Tay */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Ngón Tay</label>
                                    <select
                                        required
                                        value={formData.finger_name}
                                        onChange={e => setFormData({ ...formData, finger_name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="">-- Chọn ngón tay --</option>
                                        <optgroup label="Bàn tay phải">
                                            <option value="Ngón cái phải">Ngón cái phải</option>
                                            <option value="Ngón trỏ phải">Ngón trỏ phải</option>
                                            <option value="Ngón giữa phải">Ngón giữa phải</option>
                                            <option value="Ngón áp út phải">Ngón áp út phải</option>
                                            <option value="Ngón út phải">Ngón út phải</option>
                                        </optgroup>
                                        <optgroup label="Bàn tay trái">
                                            <option value="Ngón cái trái">Ngón cái trái</option>
                                            <option value="Ngón trỏ trái">Ngón trỏ trái</option>
                                            <option value="Ngón giữa trái">Ngón giữa trái</option>
                                            <option value="Ngón áp út trái">Ngón áp út trái</option>
                                            <option value="Ngón út trái">Ngón út trái</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isScanning}
                                        className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isScanning}
                                        className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-white
                                            ${isScanning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
                                        `}
                                    >
                                        {isScanning ? (
                                            <>
                                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                Đang chờ Pi quét...
                                            </>
                                        ) : (
                                            isEdit ? "Cập nhật" : "Bắt đầu Quét & Lưu"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}