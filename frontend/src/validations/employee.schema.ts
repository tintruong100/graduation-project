import { z } from "zod";

export const employeeSchema = z
  .object({
    employee_code: z.string().min(1, "Mã nhân viên không được để trống"),
    full_name: z.string().min(1, "Họ tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().optional(),
    date_of_birth: z.string().optional(),
    gender: z.enum(["true", "false"]),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    position: z.string().optional(),
    department_id: z.string().optional(),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
    is_active: z.enum(["true", "false"]),
  })
  .refine(
    (data) => {
      // password required when creating new employee (no id)
      return true;
    },
    { message: "" },
  );

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
