"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import {
  useEmployees,
  useEmployeesByDepartment,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { employeeSchema, type EmployeeFormValues } from "@/validations/employee.schema";
import { useConfirm } from "@/hooks/useConfirm";
import type { AuthUser } from "@/types";

// Di chuyển Interface ra ngoài component để tái sử dụng nếu cần
interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department?: { id: string, name: string };
  role: string;
  gender: boolean | string;
  date_of_birth?: string;
  phone_number?: string;
  address?: string;
  position?: string;
  is_active: boolean | string;
}

export default function EmployeeMgmt() {
  // 1. Lấy thông tin user từ Zustand store
  const currentUser = useAuthStore.getState().user;
  const isManager = currentUser?.role === "MANAGER";
  const managerId = isManager ? (currentUser as AuthUser).department_id : undefined;

  // 2. Phân quyền gọi API trực tiếp từ data trong Store
  const { data: allEmployees = [], isLoading: allEmpLoading } = useEmployees();
  const { data: deptEmployees = [], isLoading: deptEmpLoading } = useEmployeesByDepartment(managerId || "");
  const { data: departments = [], isLoading: deptLoading } = useDepartments();

  const employees: Employee[] = (isManager ? deptEmployees : allEmployees) as Employee[];
  const loading = isManager ? deptEmpLoading : (allEmpLoading || deptLoading);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // States cho form Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  // States cho modal Xem chi tiết
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(editId);
  const deleteEmployee = useDeleteEmployee();

  const { confirm, ConfirmUI } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_code: "", full_name: "", email: "", password: "",
      date_of_birth: "", gender: "true", phone_number: "", address: "",
      position: "", department_id: "", role: "EMPLOYEE", is_active: "true",
    },
  });

  const watchedRole = watch("role");
  const watchedIsActive = watch("is_active");

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xoá nhân viên",
      message: "Bạn có chắc muốn xoá nhân viên này? Hành động này không thể hoàn tác.",
      confirmLabel: "Xoá",
      variant: "danger",
    });
    if (!ok) return;
    deleteEmployee.mutate(id);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setEditId("");
    reset({
      employee_code: "", full_name: "", email: "", password: "",
      date_of_birth: "", gender: "true", phone_number: "", address: "",
      position: "", department_id: "", role: "EMPLOYEE", is_active: "true",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setIsEdit(true);
    setEditId(emp.id);
    reset({
      employee_code: emp.employee_code,
      full_name: emp.full_name,
      email: emp.email,
      password: "",
      date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : "",
      gender: String(emp.gender) as "true" | "false",
      phone_number: emp.phone_number || "",
      address: emp.address || "",
      position: emp.position || "",
      department_id: emp.department?.id || "",
      role: emp.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
      is_active: String(emp.is_active) as "true" | "false",
    });
    setIsModalOpen(true);
  };

  // Mở modal xem chi tiết
  const openViewModal = (emp: Employee) => {
    setViewEmployee(emp);
    setIsViewModalOpen(true);
  };

  const onSubmit = (values: EmployeeFormValues) => {
    if (isEdit) {
      const payload: Partial<EmployeeFormValues> = { ...values };
      if (!payload.password) delete payload.password;
      if (!payload.department_id) delete payload.department_id;
      updateEmployee.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    } else {
      const payload = { ...values, password: values.password! };
      if (!payload.department_id) delete (payload as any).department_id;
      createEmployee.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchLower) ||
      emp.employee_code?.toLowerCase().includes(searchLower);

    const matchesDept = filterDept === "" || emp.department?.id === filterDept;
    return matchesSearch && matchesDept;
  });

  // --- CÁC HÀM HELPER CHO MODAL XEM CHI TIẾT ---
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa có thông tin";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const renderGender = (gender: any) => {
    if (gender === true || gender === 1 || gender === "true") return "Nam";
    if (gender === false || gender === 0 || gender === "false") return "Nữ";
    return "Chưa có thông tin";
  };
  // ---------------------------------------------

  if (loading) return <div className="py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu nhân viên...</div>;

  return (
    <div className="p-4">
      {ConfirmUI}
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full md:w-auto">
          <h3 className="text-xl font-bold text-gray-800 mr-4">Nhân sự</h3>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm tên, mã nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95 w-full md:w-auto">
          + Thêm nhân viên
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">STT</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Mã NV</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Họ Tên</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Phòng Ban</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Vai trò</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu phù hợp</td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr key={emp.id} className={`hover:bg-blue-50/30 transition-colors ${String(emp.is_active) === "false" ? "bg-gray-50 opacity-70" : ""}`}>
                  <td className="p-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-4 text-sm font-mono text-blue-600">{emp.employee_code}</td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-800">{emp.full_name}</div>
                    <div className="text-xs text-gray-500">{emp.email} {String(emp.is_active) === "false" && <span className="text-red-500 ml-1">(Đã nghỉ)</span>}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{emp.department?.name || "Chưa set"}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      emp.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-center space-x-5">
                    <button
                      onClick={() => openViewModal(emp)}
                      className="text-green-500 hover:text-green-700 hover:scale-110 transition-all"
                      title="Xem chi tiết"
                    >
                      <FontAwesomeIcon icon={faEye} size="lg" />
                    </button>

                    <button
                      onClick={() => openEditModal(emp)}
                      className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all"
                      title="Chỉnh sửa"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                    </button>

                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                      title="Xóa nhân viên"
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

      {/* MODAL XEM CHI TIẾT */}
      {isViewModalOpen && viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Thông tin nhân viên</h2>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Trạng thái:</span>
                  <span className={`col-span-2 font-semibold ${String(viewEmployee.is_active) === "true" ? "text-green-700" : "text-red-700"}`}>
                    {String(viewEmployee.is_active) === "true" ? "Đang làm việc" : "Đã nghỉ việc"}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Mã nhân viên:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.employee_code}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Họ và tên:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.full_name}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.email}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Ngày sinh:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{formatDate(viewEmployee.date_of_birth)}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Giới tính:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{renderGender(viewEmployee.gender)}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Số điện thoại:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.phone_number || "Chưa có thông tin"}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Địa chỉ:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.address || "Chưa có thông tin"}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Chức vụ:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.position || "Chưa có chức vụ"}</span>
                </div>
                <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                  <span className="text-gray-500 font-medium">Phòng ban:</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.department?.name || "Chưa phân bổ"}</span>
                </div>
                <div className="grid grid-cols-3 pb-2 items-center">
                  <span className="text-gray-500 font-medium">Vai trò:</span>
                  <span className="col-span-2">
                    <span className={`${viewEmployee.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : viewEmployee.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                      {viewEmployee.role}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ Tên</label>
                    <input type="text" {...register("full_name")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input type="email" {...register("email")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                {!isEdit && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu ban đầu</label>
                    <input type="password" {...register("password")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                    <input type="date" {...register("date_of_birth")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giới tính</label>
                    <select {...register("gender")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại / Địa chỉ</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="tel" placeholder="Số điện thoại" {...register("phone_number")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="text" placeholder="Địa chỉ" {...register("address")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chức vụ</label>
                    <input type="text" {...register("position")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai trò hệ thống</label>
                    <select {...register("role")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="EMPLOYEE">Nhân Viên</option>
                      <option value="MANAGER">Trưởng Phòng</option>
                      <option value="ADMIN">Quản Trị</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phòng ban trực thuộc</label>
                  <select {...register("department_id")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {isEdit && watchedRole !== "ADMIN" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đã nghỉ</label>
                    <input
                      type="checkbox"
                      checked={watchedIsActive === "false"}
                      onChange={e => setValue("is_active", e.target.checked ? "false" : "true")}
                      className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-semibold transition-colors">Hủy</button>
                  <button
                    type="submit"
                    disabled={isSubmitting || createEmployee.isPending || updateEmployee.isPending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95"
                  >
                    Lưu thay đổi
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