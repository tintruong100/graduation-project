import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetch/client";
import type { ScanLog } from "@/types";

export const scanLogKeys = {
  all: ["scan-logs"] as const,
  lists: () => [...scanLogKeys.all, "list"] as const,
};

export function useScanLogs() {
  return useQuery({
    queryKey: scanLogKeys.lists(),
    queryFn: () => fetchClient.get<ScanLog[]>("/fingerprints/scan-log"),
    select: (res) => res.data ?? [],
  });
}

export function useDeleteScanLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchClient.delete<void>(`/fingerprints/scan-log/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scanLogKeys.lists() });
      toast.success("Xoá lịch sử thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xoá.");
    },
  });
}
