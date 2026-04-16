import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetch/client";
import type { Department } from "@/types";
import type { DepartmentFormValues } from "@/validations/department.schema";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  detail: (id: string) => [...departmentKeys.all, "detail", id] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: () => fetchClient.get<Department[]>("/departments"),
    select: (res) => res.data ?? [],
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => fetchClient.get<Department>(`/departments/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormValues) =>
      fetchClient.post<Department>("/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      toast.success("Thêm phòng ban thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thêm phòng ban thất bại");
    },
  });
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DepartmentFormValues>) =>
      fetchClient.put<Department>(`/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      toast.success("Cập nhật phòng ban thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật phòng ban thất bại");
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient.delete<void>(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      toast.success("Xoá phòng ban thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xoá phòng ban thất bại");
    },
  });
}
