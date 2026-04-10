import { z } from "zod";

export const loginSchema = z.object({
  employee_code: z
    .string()
    .min(1, "Vui lòng nhập mã nhân viên")
    .max(50, "Mã nhân viên không được quá 50 ký tự"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
