import { z } from "zod";

export const fingerprintSchema = z.object({
  employee_id: z.string().min(1, "Vui lòng chọn nhân viên"),
  finger_name: z.string().min(1, "Tên ngón tay không được để trống"),
});

export type FingerprintFormValues = z.infer<typeof fingerprintSchema>;
