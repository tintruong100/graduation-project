import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetch/client";
import type { Employee } from "@/types";
import type { EmployeeFormValues } from "@/validations/employee.schema";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  byDept: (deptId: string) => [...employeeKeys.all, "dept", deptId] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => fetchClient.get<Employee[]>("/employees"),
    select: (res) => res.data ?? [],
  });
}

export function useEmployeesByDepartment(deptId: string) {
  return useQuery({
    queryKey: employeeKeys.byDept(deptId),
    queryFn: () => fetchClient.get<Employee[]>(`/employees/${deptId}`),
    enabled: !!deptId,
    select: (res) => res.data ?? [],
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchClient.get<Employee>(`/employees/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<EmployeeFormValues, "id"> & { password: string }) =>
      fetchClient.post<Employee>("/employees", {
        ...data,
        gender: data.gender === "true",
        is_active: data.is_active === "true",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Thêm nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thêm nhân viên thất bại");
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeFormValues>) =>
      fetchClient.put<Employee>(`/employees/${id}`, {
        ...data,
        ...(data.gender !== undefined && { gender: data.gender === "true" }),
        ...(data.is_active !== undefined && { is_active: data.is_active === "true" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      toast.success("Cập nhật nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật nhân viên thất bại");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchClient.delete<void>(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Xoá nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xoá nhân viên thất bại");
    },
  });
}
