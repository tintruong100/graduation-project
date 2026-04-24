// src/hooks/useAttendance.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/lib/fetch/client";
import toast from "react-hot-toast";
import type { AttendanceSummary } from "@/types";

// ==========================================
// 1. HOOK: LẤY BẢNG CÔNG THEO THÁNG CỦA 1 NHÂN VIÊN
// Dành cho Nhân viên xem của mình, hoặc Admin xem chi tiết 1 người
// ==========================================
export function useMonthlyAttendance(employeeId: string, month: number, year: number) {
    return useQuery({
        queryKey: ["attendance", "monthly", employeeId, month, year],
        queryFn: () =>
            fetchClient.get<AttendanceSummary[]>(
                `/attendance/monthly/${employeeId}?month=${month}&year=${year}`
            ),
        select: (res) => res.data ?? [],
        // Chỉ gọi API khi đã có ID nhân viên
        enabled: !!employeeId,
    });
}

// ==========================================
// 2. HOOK: LẤY TỔNG HỢP CÔNG TOÀN CÔNG TY TRONG 1 NGÀY
// Dành riêng cho Admin / Manager
// ==========================================
export function useDailyAttendanceAll(date: string) {
    return useQuery({
        queryKey: ["attendance", "daily-all", date],
        queryFn: () =>
            fetchClient.get<AttendanceSummary[]>(`/attendance/daily-all?date=${date}`),
        select: (res) => res.data ?? [],
        enabled: !!date,
    });
}

// ==========================================
// 3. HOOK: LẤY CHI TIẾT 1 NGÀY CỦA 1 NHÂN VIÊN
// (Có thể dùng khi Admin click vào 1 dòng để xem chi tiết)
// ==========================================
export function useDailyAttendance(employeeId: string, date: string) {
    return useQuery({
        queryKey: ["attendance", "daily", employeeId, date],
        queryFn: () =>
            fetchClient.get<AttendanceSummary | null>(
                `/attendance/daily/${employeeId}?date=${date}`
            ),
        select: (res) => res.data ?? null,
        enabled: !!employeeId && !!date,
    });
}

// ==========================================
// 4. HOOK (MUTATION): CHỐT SỔ THỦ CÔNG (ADMIN)
// ==========================================
export function useTriggerFinalize() {
    const queryClient = useQueryClient();

    return useMutation({
        // Vì endpoint này dùng POST, ta gọi fetchClient.post và truyền body rỗng {}
        mutationFn: (date: string) =>
            fetchClient.post(`/attendance/trigger-finalize?date=${date}`, {}),
        onSuccess: (res, variables) => {
            // variables ở đây chính là cái 'date' truyền vào lúc gọi mutate
            // Invalidate để bảng data tự động load lại đúng ngày vừa chốt
            queryClient.invalidateQueries({
                queryKey: ["attendance", "daily-all", variables],
            });
            toast.success(`Đã chốt sổ thành công cho ngày ${variables}!`);
        },
        onError: (error: any) => {
            // Tận dụng ApiError từ fetchClient ném ra
            toast.error(error.message || "Lỗi khi chốt sổ điểm danh");
        },
    });
}