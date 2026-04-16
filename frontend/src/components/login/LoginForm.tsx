"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/validations/auth.schema";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { employee_code: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Employee Code */}
      <div className="space-y-2 text-left">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="employee_code"
        >
          Mã nhân viên
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="employee_code"
            type="text"
            autoComplete="username"
            placeholder="Nhập mã nhân viên của bạn"
            {...register("employee_code")}
            className={cn(
              "block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white sm:text-sm transition-all outline-none",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              errors.employee_code ? "border-red-400" : "border-gray-200 dark:border-gray-700",
            )}
          />
        </div>
        {errors.employee_code && (
          <p className="text-xs text-red-500">{errors.employee_code.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2 text-left">
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          htmlFor="password"
        >
          Mật khẩu
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(
              "block w-full pl-10 pr-3 py-3 border rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white sm:text-sm transition-all outline-none",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              errors.password ? "border-red-400" : "border-gray-200 dark:border-gray-700",
            )}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        size="lg"
        className="w-full"
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Đăng nhập
      </Button>
    </form>
  );
}
