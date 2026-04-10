"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { departmentSchema, type DepartmentFormValues } from "@/validations/department.schema";
import { useConfirm } from "@/hooks/useConfirm";
import type { Employee } from "@/types";

interface Department {
  id: string;
  name: string;
  manager?: { id: string; full_name: string; employee_code: string };
  employees?: { id: string }[];
  start_time: string;
  end_time: string;
}

export default function DepartmentMgmt() {
  const { data: departments = [], isLoading: deptLoading } = useDepartments();
  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const createDept = useCreateDepartment();
  const deleteDept = useDeleteDepartment();

  const loading = deptLoading || empLoading;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const updateDept = useUpdateDepartment(editId);

  const { confirm, ConfirmUI } = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", manager_id: "", start_time: "08:00", end_time: "17:00" },
  });

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xoá phòng ban",
      message: "Bạn có chắc muốn xoá phòng ban này? Các nhân viên trực thuộc có thể bị ảnh hưởng.",
      confirmLabel: "Xoá",
      variant: "danger",
    });
    if (!ok) return;
    deleteDept.mutate(id);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setEditId("");
    reset({ name: "", manager_id: "", start_time: "08:00", end_time: "17:00" });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setIsEdit(true);
    setEditId(dept.id);
    reset({
      name: dept.name,
      manager_id: dept.manager?.id || "",
      start_time: dept.start_time?.slice(0, 5) || "08:00",
      end_time: dept.end_time?.slice(0, 5) || "17:00",
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: DepartmentFormValues) => {
    const payload = { ...values };
    if (!payload.manager_id) delete (payload as Partial<typeof payload>).manager_id;

    if (isEdit) {
      updateDept.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createDept.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu phòng ban...</div>;

  return (
    <div className="p-4">
      {ConfirmUI}
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div >
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên phòng ban</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phòng Kỹ thuật"
                    {...register("name")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trưởng phòng</label>
                  <select
                    {...register("manager_id")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                  >
                    <option value="">-- Chọn nhân sự quản lý --</option>
                    {employees
                      .filter((emp: Employee) => emp.role === 'MANAGER' || emp.role === 'ADMIN')
                      .map((emp: Employee) => (
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
                    <input type="time" {...register("start_time")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ kết thúc</label>
                    <input type="time" {...register("end_time")} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                    {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-semibold transition-colors">Hủy</button>
                  <button
                    type="submit"
                    disabled={isSubmitting || createDept.isPending || updateDept.isPending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all active:scale-95"
                  >
                    Lưu thông tin
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