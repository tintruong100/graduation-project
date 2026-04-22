"use client";
import { useEffect, useState } from "react";
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
import { Table, type Column } from "@/components/ui/Table";
import type { AuthUser, Department } from "@/types";

// Di chuyển Interface ra ngoài component để tái sử dụng nếu cần
interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  role: string;
  gender: boolean | string;
  date_of_birth?: string;
  phone_number?: string;
  address?: string;
  position?: string;
  custom_start_time?: string;
  custom_end_time?: string;
  is_active: boolean | string;
  department?: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
  };
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
      position: "", department_id: "", role: "EMPLOYEE", custom_start_time: "",
      custom_end_time: "", is_active: "true",
    },
  });

  const watchedRole = watch("role");
  const watchedIsActive = watch("is_active");
  const selectedDeptId = watch("department_id");

  // Tìm dữ liệu phòng ban tương ứng
  const selectedDept = departments.find(d => d.id === selectedDeptId);

  const [isDeptTimeActive, setIsDeptTimeActive] = useState(true);

  // Tự động điền giờ khi tick chọn giờ phòng ban
  useEffect(() => {
    if (isDeptTimeActive && selectedDept) {
      setValue("custom_start_time", selectedDept.start_time);
      setValue("custom_end_time", selectedDept.end_time);
    }
  }, [isDeptTimeActive, selectedDept, setValue]);

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
    setIsDeptTimeActive(true);
    reset({
      employee_code: "", full_name: "", email: "", password: "",
      date_of_birth: "", gender: "true", phone_number: "", address: "",
      position: "", department_id: "", role: "EMPLOYEE", custom_start_time: "",
      custom_end_time: "", is_active: "true",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setIsEdit(true);
    setEditId(emp.id);
    setIsDeptTimeActive(!emp.custom_start_time && !emp.custom_end_time);
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
      custom_start_time: emp.custom_start_time || "",
      custom_end_time: emp.custom_end_time || "",
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
    const finalValues = {
      ...values,
      // Nếu chọn giờ phòng ban, ép về null khi gửi API
      custom_start_time: isDeptTimeActive ? null : values.custom_start_time,
      custom_end_time: isDeptTimeActive ? null : values.custom_end_time,
    };
    if (isEdit) {
      const payload: Partial<EmployeeFormValues> = { ...finalValues };
      if (!payload.password) delete payload.password;
      if (!payload.department_id) delete payload.department_id;
      updateEmployee.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    } else {
      const payload = { ...finalValues, password: finalValues.password! };
      if (!payload.department_id) delete (payload as Partial<typeof payload>).department_id;
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

  const renderGender = (gender: boolean | number | string | null | undefined): string => {
    if (gender === true || gender === 1 || gender === "true") return "Nam";
    if (gender === false || gender === 0 || gender === "false") return "Nữ";
    return "Chưa có thông tin";
  };
  // ---------------------------------------------

  if (loading) return null; // loading.tsx handles skeleton

  const empColumns: Column<Employee>[] = [
    {
      key: "index",
      header: "STT",
      className: "w-14",
      render: (_v, _r, index) => <span className="text-gray-500">{index + 1}</span>,
    },
    {
      key: "employee_code",
      header: "Mã NV",
      render: (_v, emp) => <span className="font-mono text-blue-600">{emp.employee_code}</span>,
    },
    {
      key: "full_name",
      header: "Họ Tên",
      render: (_v, emp) => (
        <div>
          <div className="text-sm font-semibold text-gray-800">{emp.full_name}</div>
          <div className="text-xs text-gray-500">
            {emp.email}
            {String(emp.is_active) === "false" && <span className="text-red-500 ml-1">(Đã nghỉ)</span>}
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Phòng Ban",
      render: (_v, emp) => <span className="text-gray-600">{emp.department?.name || "Chưa set"}</span>,
    },
    {
      key: "role",
      header: "Vai trò",
      render: (_v, emp) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === "ADMIN" ? "bg-red-100 text-red-700" :
          emp.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-700"
          }`}>
          {emp.role}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-center",
      render: (_v, emp) => (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => openViewModal(emp)} className="text-green-500 hover:text-green-700 hover:scale-110 transition-all" title="Xem chi tiết">
            <FontAwesomeIcon icon={faEye} size="lg" />
          </button>
          <button onClick={() => openEditModal(emp)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all" title="Chỉnh sửa">
            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
          </button>
          <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:text-red-700 hover:scale-110 transition-all" title="Xóa nhân viên">
            <FontAwesomeIcon icon={faTrashCan} size="lg" />
          </button>
        </div>
      ),
    },
  ];

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
      <Table<Employee>
        data={filteredEmployees}
        columns={empColumns}
        rowKey="id"
        emptyMessage="Không tìm thấy dữ liệu phù hợp"
        defaultPageSize={10}
      />

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
                <div className="grid grid-cols-2 border-b border-gray-100 pb-3 items-center">
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Ngày sinh:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{formatDate(viewEmployee.date_of_birth)}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Giới tính:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{renderGender(viewEmployee.gender)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-100 pb-3 items-center">
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Số điện thoại:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.phone_number || "Chưa có thông tin"}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Địa chỉ:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.address || "Chưa có thông tin"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-100 pb-3 items-center">
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Chức vụ:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.position || "Chưa có chức vụ"}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Phòng ban:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.department?.name || "Chưa phân bổ"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-100 pb-3 items-center">
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Giờ bắt đầu:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.custom_start_time || viewEmployee.department?.start_time || "Chưa có thông tin"}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Giờ kết thúc:</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{viewEmployee.custom_end_time || viewEmployee.department?.end_time || "Chưa có thông tin"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-100 pb-3 items-center">
                  <div className="grid grid-cols-3 pb-2 items-center">
                    <span className="text-gray-500 font-medium">Vai trò:</span>
                    <span className="col-span-2">
                      <span className={`${viewEmployee.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : viewEmployee.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                        {viewEmployee.role}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
                    <span className="text-gray-500 font-medium">Trạng thái:</span>
                    <span className={`col-span-2 font-semibold ${String(viewEmployee.is_active) === "true" ? "text-green-700" : "text-red-700"}`}>
                      {String(viewEmployee.is_active) === "true" ? "Đang làm việc" : "Đã nghỉ việc"}
                    </span>
                  </div>
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
                    {departments.map((d: Department) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      {...register("custom_start_time")}
                      disabled={isDeptTimeActive} // Khóa khi chọn giờ phòng ban
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${isDeptTimeActive ? 'bg-gray-100' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ kết thúc</label>
                    <input
                      type="time"
                      {...register("custom_end_time")}
                      disabled={isDeptTimeActive} // Khóa khi chọn giờ phòng ban
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${isDeptTimeActive ? 'bg-gray-100' : ''}`}
                    />
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ làm theo phòng ban</label>
                    <input
                      type="checkbox"
                      checked={isDeptTimeActive}
                      onChange={e => setIsDeptTimeActive(e.target.checked)}
                      className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  {isEdit && watchedRole !== "ADMIN" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đã nghỉ việc</label>
                      <input
                        type="checkbox"
                        checked={watchedIsActive === "false"}
                        // Đã nghỉ việc thì set is_active = "false"
                        onChange={e => setValue("is_active", e.target.checked ? "false" : "true")}
                        className="ml-2 h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>


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