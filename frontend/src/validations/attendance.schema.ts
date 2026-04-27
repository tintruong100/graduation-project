import { z } from "zod";

export const attendanceSchema = z.object({
    employee_id: z.string().min(1, "Vui lòng chọn nhân viên"),
    work_date: z.string().min(1, "Ngày làm việc không được để trống"),
    first_scan_time: z.string().nullable().optional(),
    last_scan_time: z.string().nullable().optional(),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "MISSING_OUT"]),
    is_manually_edited: z.enum(["true", "false"]).optional(),
    edit_note: z.string().nullable().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;