"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";

export default function DepartmentMgmt() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
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
        fetchWithAuth("/employees") // To get managers
      ]);
      if (deptRes.ok) setDepartments((await deptRes.json()).data || []);
      if (empRes.ok) setEmployees((await empRes.json()).data || []);
    } catch (e) {
      console.error(e);
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
    setFormData({ id: "", name: "", manager_id: "", start_time: "08:00", end_time: "17:00" });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setIsEdit(true);
    setFormData({
      id: dept.id,
      name: dept.name,
      manager_id: dept.manager?.id || "",
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

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(body.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Đang tải dữ liệu phòng ban...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Danh sách Phòng ban</h3>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
          + Thêm phòng ban
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-600 text-sm">Tên phòng ban</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Trưởng phòng</th>
              <th className="p-3 font-semibold text-gray-600 text-sm text-center">Số lượng NV</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Thời gian LV</th>
              <th className="p-3 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              departments.map((dept: any) => (
                <tr key={dept.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm font-medium text-gray-800">{dept.name}</td>
                  <td className="p-3 text-sm text-gray-600">{dept.manager?.full_name || "Chưa có"}</td>
                  <td className="p-3 text-sm text-center text-gray-600">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">{dept.employees?.length || 0}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{dept.start_time} - {dept.end_time}</td>
                  <td className="p-3 text-sm text-center space-x-3">
                    <button onClick={() => openEditModal(dept)} className="text-indigo-600 hover:text-indigo-800 font-medium">Sửa</button>
                    <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:text-red-700 font-medium">Xoá</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl text-gray-600 font-bold mb-4">{isEdit ? "Sửa Phòng Ban" : "Thêm Phòng Ban"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng ban</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trưởng phòng</label>
                <select value={formData.manager_id} onChange={e => setFormData({ ...formData, manager_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600">
                  <option value="">-- Chưa có trưởng phòng --</option>
                  {employees
                    .filter((emp: any) => emp.role === 'MANAGER')
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                  <input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                  <input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Hủy</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
