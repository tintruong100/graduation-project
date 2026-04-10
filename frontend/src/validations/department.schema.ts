import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống").max(100),
  manager_id: z.string().optional(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Định dạng giờ phải là HH:mm"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Định dạng giờ phải là HH:mm"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
