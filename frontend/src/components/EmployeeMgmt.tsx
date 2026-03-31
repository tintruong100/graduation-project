"use client";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";

export default function EmployeeMgmt() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho ô tìm kiếm chữ và lọc theo phòng ban
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    employee_code: "",
    full_name: "",
    email: "",
    password: "",
    position: "",
    department_id: "",
    role: "EMPLOYEE",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        fetchWithAuth("/employees"),
        fetchWithAuth("/departments")
      ]);
      if (empRes.ok) setEmployees((await empRes.json()).data || []);
      if (deptRes.ok) setDepartments((await deptRes.json()).data || []);
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
    if (!confirm("Bạn có chắc muốn xoá nhân viên này?")) return;
    try {
      const res = await fetchWithAuth(`/employees/${id}`, { method: "DELETE" });
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
    setFormData({ id: "", employee_code: "", full_name: "", email: "", password: "", position: "", department_id: "", role: "EMPLOYEE" });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setIsEdit(true);
    setFormData({
      id: emp.id,
      employee_code: emp.employee_code,
      full_name: emp.full_name,
      email: emp.email,
      password: "", // empty for edit
      position: emp.position || "",
      department_id: emp.department?.id || "",
      role: emp.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEdit ? `/employees/${formData.id}` : `/employees`;
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...formData };
      if (isEdit && !payload.password) {
        delete (payload as any).password;
      }
      if (!payload.department_id) delete (payload as any).department_id;

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.ok) {
        if (!isEdit) {
          alert("Thêm nhân viên thành công!\nMã nhân viên: " + body.data.employee_code);
        } else {
          alert("Cập nhật nhân viên thành công!");
        }
        setIsModalOpen(false);
        loadData();
      } else {
        alert(body.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Lọc kép: Theo tên/mã NV VÀ Theo phòng ban
  const filteredEmployees = employees.filter((emp: any) => {
    // 1. Kiểm tra điều kiện tìm kiếm chữ
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchLower) ||
      emp.employee_code?.toLowerCase().includes(searchLower);

    // 2. Kiểm tra điều kiện phòng ban (Nếu filterDept rỗng "" thì coi như đúng hết)
    // Lưu ý: Kiểm tra xem ID phòng ban của nhân viên có khớp với ID đang chọn không
    const matchesDept = filterDept === "" || emp.department?.id === filterDept;

    // Trả về true nếu thỏa mãn CẢ HAI điều kiện
    return matchesSearch && matchesDept;
  });

  if (loading) return <div className="py-8 text-center text-gray-500">Đang tải dữ liệu nhân viên...</div>;

  return (
    <div>
      {/* HEADER: Tiêu đề + Các bộ lọc + Nút Thêm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">

        {/* Cụm Tiêu đề và Bộ lọc */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full md:w-auto">
          <h3 className="text-lg font-semibold text-gray-700 whitespace-nowrap mr-2">Danh sách Nhân viên</h3>

          {/* 1. Ô Tìm kiếm Text */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Tìm tên, mã NV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 2. Ô Lọc theo Phòng ban (Dropdown) */}
          <div className="w-full sm:w-48">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white text-gray-600 cursor-pointer"
            >
              <option value="">-- Tất cả phòng ban --</option>
              {/* Render danh sách phòng ban từ mảng departments đã có sẵn */}
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nút Thêm mới */}
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
          + Thêm nhân viên
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-600 text-sm">Mã NV</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Họ Tên</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Email</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Phòng Ban</th>
              <th className="p-3 font-semibold text-gray-600 text-sm">Vai trò</th>
              <th className="p-3 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Đổi thành filteredEmployees.length */}
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {searchTerm || filterDept ? "Không tìm thấy nhân viên" : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              // 2. Đổi thành filteredEmployees.map
              filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm text-gray-600">{emp.employee_code}</td>
                  <td className="p-3 text-sm font-medium text-gray-800">{emp.full_name}</td>
                  <td className="p-3 text-sm text-gray-600">{emp.email}</td>
                  <td className="p-3 text-sm text-gray-600">{emp.department?.name || "-"}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : emp.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-center space-x-3">
                    <button onClick={() => openEditModal(emp)} className="text-indigo-600 hover:text-indigo-800 font-medium">Sửa</button>
                    <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 font-medium">Xoá</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">{isEdit ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ Tên</label>
                <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                  <input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600">
                    <option value="EMPLOYEE">Nhân Viên</option>
                    <option value="MANAGER">Trưởng Phòng</option>
                    <option value="ADMIN">Quản Trị</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm text-gray-600">
                  <option value="">-- Chưa có phòng ban --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
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
