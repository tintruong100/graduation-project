"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface Department {
  id: string;
  name: string;
  manager?: { id: string, full_name: string, employee_code: string };
  employees?: any[];
  start_time: string;
  end_time: string;
}

export default function DepartmentMgmt() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    manager_id: "",
    start_time: "08:00",
    end_time: "17:00",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        fetchWithAuth("/departments"),
        fetchWithAuth("/employees")
      ]);
      if (deptRes.ok) setDepartments((await deptRes.json()).data || []);
      if (empRes.ok) setEmployees((await empRes.json()).data || []);
    } catch (e) {
      console.error("Lỗi tải dữ liệu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá phòng ban này? Các nhân viên trực thuộc có thể bị ảnh hưởng.")) return;
    try {
      const res = await fetchWithAuth(`/departments/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (res.ok) {
        alert(body.message || "Xoá phòng ban thành công");
        loadData();
      } else {
        alert(body.message || "Có lỗi xảy ra");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({ id: "", name: "", manager_id: "", start_time: "08:00", end_time: "17:00" });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setIsEdit(true);
    setFormData({
      id: dept.id,
      name: dept.name,
      manager_id: dept.manager?.id || "",
      // Đảm bảo lấy đúng định dạng HH:mm
      start_time: dept.start_time?.slice(0, 5) || "08:00",
      end_time: dept.end_time?.slice(0, 5) || "17:00",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEdit ? `/departments/${formData.id}` : `/departments`;
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...formData };
      if (!payload.manager_id) delete (payload as any).manager_id;
      if (!isEdit) delete (payload as any).id;

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.ok) {
        alert(isEdit ? "Cập nhật phòng ban thành công!" : "Thêm phòng ban thành công!");
        setIsModalOpen(false);
        loadData();
      } else {
        alert(body.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu phòng ban...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Cơ cấu Phòng ban</h3>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95">
          + Thêm phòng ban
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">STT</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Tên phòng ban</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Trưởng phòng</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Số lượng NV</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Thời gian LV</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">Chưa có dữ liệu phòng ban</td>
              </tr>
            ) : (
              departments.map((dept, index) => (
                <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{dept.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {dept.manager ? (
                      <div>
                        <p className="font-medium text-gray-800">{dept.manager.full_name}</p>
                        <p className="text-xs text-gray-400">{dept.manager.employee_code}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Chưa bổ nhiệm</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                      {dept.employees?.length || 0}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium">
                    {dept.start_time.slice(0, 5)} - {dept.end_time.slice(0, 5)}
                  </td>
                  <td className="p-4 text-sm text-center space-x-4">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all"
                      title="Chỉnh sửa"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                    </button>

                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                      title="Xóa phòng ban"
                    >
                      <FontAwesomeIcon icon={faTrashCan} size="lg" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                {isEdit ? "Cập nhật phòng ban" : "Tạo phòng ban mới"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div >
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên phòng ban</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phòng Kỹ thuật"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trưởng phòng</label>
                  <select
                    value={formData.manager_id}
                    onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                  >
                    <option value="">-- Chọn nhân sự quản lý --</option>
                    {employees
                      .filter((emp: any) => emp.role === 'MANAGER' || emp.role === 'ADMIN')
                      .map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ bắt đầu</label>
                    <input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ kết thúc</label>
                    <input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-semibold transition-colors">Hủy</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95">Lưu thông tin</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}