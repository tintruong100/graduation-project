import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetch/client";
import { useAuthStore } from "@/store/auth.store";
import type { ApiResponse, LoginResponse } from "@/types";
import type { LoginFormValues } from "@/validations/auth.schema";

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginFormValues) =>
      fetchClient.post<LoginResponse>("/auth/login", credentials),

    onSuccess: (res: ApiResponse<LoginResponse>) => {
      const { token, user } = res.data;

      setAuth(user, token);

      // Set cookie for proxy.ts route protection (non-httpOnly, readable at edge)
      document.cookie = `hrm-token=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;

      queryClient.setQueryData(["auth", "me"], user);
      toast.success(`Chào mừng, ${user.full_name}!`);

      if (user.role === "ADMIN") {
        router.push("/dashboard/overview");
      } else if (user.role === "MANAGER") {
        router.push("/dashboard/employees");
      } else {
        router.push("/dashboard/profile");
      }
    },

    onError: (error: Error) => {
      toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    // Backend không có /auth/logout endpoint — chỉ xử lý client-side
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      logout();
      document.cookie = "hrm-token=; path=/; max-age=0";
      queryClient.clear();
      toast.success("Đã đăng xuất thành công");
      router.push("/login");
    },
  });
}

export function useCurrentUser() {
  const { user } = useAuthStore();
  return user;
}

export function useChangePassword() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      fetchClient.put<void>("/auth/change-password", data),

    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      logout();
      document.cookie = "hrm-token=; path=/; max-age=0";
      router.push("/login");
    },

    onError: (error: Error) => {
      toast.error(error.message || "Đổi mật khẩu thất bại!");
    },
  });
}
