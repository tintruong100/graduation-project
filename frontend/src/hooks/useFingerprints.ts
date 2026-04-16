import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetch/client";
import type { Fingerprint } from "@/types";
import type { FingerprintFormValues } from "@/validations/fingerprint.schema";

export const fingerprintKeys = {
  all: ["fingerprints"] as const,
  lists: () => [...fingerprintKeys.all, "list"] as const,
  detail: (id: string) => [...fingerprintKeys.all, "detail", id] as const,
};

export function useFingerprints() {
  return useQuery({
    queryKey: fingerprintKeys.lists(),
    queryFn: () => fetchClient.get<Fingerprint[]>("/fingerprints"),
    select: (res) => res.data ?? [],
  });
}

export function useCreateFingerprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FingerprintFormValues) =>
      fetchClient.post<Fingerprint>("/fingerprints", {
        employee_id: data.employee_id,
        finger_name: data.finger_name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fingerprintKeys.lists() });
      toast.success("Thêm vân tay thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thêm vân tay thất bại");
    },
  });
}

export function useUpdateFingerprint(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<FingerprintFormValues, "finger_name">) =>
      fetchClient.put<Fingerprint>(`/fingerprints/${id}`, {
        finger_name: data.finger_name,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fingerprintKeys.lists() });
      toast.success("Cập nhật vân tay thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật vân tay thất bại");
    },
  });
}

export function useDeleteFingerprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient.delete<void>(`/fingerprints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fingerprintKeys.lists() });
      toast.success("Xoá vân tay thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xoá vân tay thất bại");
    },
  });
}
