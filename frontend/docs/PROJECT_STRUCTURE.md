# HRM System — Frontend Architecture Guide

> **Stack**: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query v5 · Zustand · Zod · React Hook Form · React Hot Toast

---

## 📁 Cấu trúc thư mục

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout — gắn Providers + Toaster
│   ├── page.tsx                # "/" → redirect /login
│   ├── login/
│   │   └── page.tsx            # Trang đăng nhập
│   └── dashboard/
│       ├── layout.tsx          # Dashboard shell (Sidebar, Header, auth guard)
│       ├── overview/page.tsx   # Chỉ ADMIN
│       ├── departments/page.tsx
│       ├── employees/page.tsx
│       ├── fingerprints/page.tsx
│       ├── scan-history/page.tsx
│       ├── attendance-report/page.tsx
│       ├── leave-ot/page.tsx
│       └── profile/page.tsx
│
├── components/
│   ├── ui/                     # Common reusable components
│   │   ├── Button.tsx          # Variants: primary | secondary | danger | ghost
│   │   ├── Loading.tsx         # Spinner với text, fullPage mode
│   │   ├── Table.tsx           # Generic table với column definition
│   │   └── PageWrapper.tsx     # Layout chuẩn với Suspense fallback
│   ├── login/LoginForm.tsx     # react-hook-form + zod validation
│   ├── layout/UserProfile.tsx  # Dropdown profile + đổi mật khẩu modal
│   └── dashboard/
│       ├── overview/OverviewDashboard.tsx
│       ├── departments/DepartmentMgmt.tsx
│       ├── employees/EmployeeMgmt.tsx
│       ├── fingerprint/FingerprintMgmt.tsx
│       └── scan-history/ScanLog.tsx
│
├── hooks/                      # TanStack Query hooks (data fetching)
│   ├── useAuth.ts              # useLogin, useLogout, useCurrentUser, useChangePassword
│   ├── useDepartments.ts       # useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment
│   ├── useEmployees.ts         # useEmployees, useEmployeesByDepartment, useCreateEmployee, ...
│   ├── useFingerprints.ts      # useFingerprints, useCreateFingerprint, useUpdateFingerprint, useDeleteFingerprint
│   └── useScanLogs.ts          # useScanLogs, useDeleteScanLog
│
├── lib/
│   ├── fetch/
│   │   ├── client.ts           # fetchClient — Bearer token auth, 401 auto-logout
│   │   └── query-client.ts     # TanStack QueryClient singleton
│   └── utils.ts                # cn() — tailwind class merger (clsx + twMerge)
│
├── providers/
│   ├── AuthProvider.tsx        # React Context: AuthContext + useAuth() consumer hook
│   └── QueryProvider.tsx       # TanStack QueryClientProvider wrapper
│
├── store/
│   └── auth.store.ts           # Zustand store — token + user persist to localStorage
│
├── types/
│   └── index.ts                # Global TypeScript interfaces (ApiResponse, User, Employee, ...)
│
├── validations/                # Zod schemas
│   ├── auth.schema.ts          # loginSchema → LoginFormValues
│   ├── department.schema.ts    # departmentSchema → DepartmentFormValues
│   ├── employee.schema.ts      # employeeSchema → EmployeeFormValues
│   ├── fingerprint.schema.ts   # fingerprintSchema → FingerprintFormValues
│   └── changePassword.schema.ts # changePasswordSchema → ChangePasswordFormValues
│
└── proxy.ts                    # Next.js Proxy (Middleware) — route + role protection
```

---

## 🔄 Luồng dữ liệu: Types → API → Hooks → Page

Đây là quy trình chuẩn khi thêm 1 tính năng mới. Mỗi lớp chỉ phụ thuộc vào lớp bên dưới nó.

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: types/index.ts  — định nghĩa shape của dữ liệu       │
│  Layer 2: lib/fetch/client.ts — gửi HTTP request + xử lý auth  │
│  Layer 3: hooks/*.ts  — TanStack Query bọc fetchClient          │
│  Layer 4: validations/*.ts  — Zod schema cho form              │
│  Layer 5: components/  — Form dùng react-hook-form + hooks     │
└─────────────────────────────────────────────────────────────────┘
```

---

### Layer 1: `types/index.ts` — Shape của dữ liệu

Mọi interface đều được định nghĩa tập trung ở đây. Không define lại interface trong component.

```ts
// Wrapper chuẩn của backend: { success, message, data }
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// Interface phản ánh đúng response của backend API
export interface Department {
  id: string;
  name: string;
  manager?: { id: string; full_name: string; employee_code: string };
  start_time: string;
  end_time: string;
}
```

> **Quy tắc**: Nếu backend thêm field mới, chỉ cần sửa interface ở đây — toàn bộ app tự động có typing đúng.

---

### Layer 2: `lib/fetch/client.ts` — HTTP Client

`fetchClient` là lớp transport duy nhất. Tự động đính kèm Bearer token, throw `ApiError` khi response không OK, redirect `/login` khi 401.

```ts
// Sử dụng
const response = await fetchClient.get<Department[]>("/departments");
// response: ApiResponse<Department[]> = { success, message, data: [...] }

await fetchClient.post<Department>("/departments", { name: "IT", start_time: "08:00" });
await fetchClient.put<Department>("/departments/123", { name: "R&D" });
await fetchClient.delete("/departments/123");
```

**Cơ chế Bearer token:**
```
User đăng nhập → token lưu vào Zustand store (persist localStorage)
                                    ↓
fetchClient.get("/xyz")  →  đọc token = useAuthStore.getState().token
                         →  Header: Authorization: Bearer <token>
                                    ↓
                         response 401?  →  logout() + redirect /login
                         response OK?   →  trả về ApiResponse<T>
```

---

### Layer 3: `hooks/*.ts` — Data Fetching với TanStack Query

Hooks bọc `fetchClient` và quản lý: cache, loading state, error state, auto-refetch sau mutation.

```ts
// hooks/useDepartments.ts — ví dụ đầy đủ

export function useDepartments() {
  return useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => fetchClient.get<Department[]>("/departments"),
    select: (res) => res.data ?? [],          // trích data từ ApiResponse wrapper
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentFormValues) =>
      fetchClient.post<Department>("/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] }); // tự refetch list
      toast.success("Thêm phòng ban thành công!");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateDepartment(id: string) {
  // id truyền vào lúc gọi hook, KHÔNG truyền lúc mutate
  return useMutation({
    mutationFn: (data: Partial<DepartmentFormValues>) =>
      fetchClient.put<Department>(`/departments/${id}`, data),
    ...
  });
}
```

**Pattern quan trọng cho Update:**
```tsx
// Trong component — phải set editId TRƯỚC khi open modal
const [editId, setEditId] = useState("");
const updateDepartment = useUpdateDepartment(editId); // hook nhận id ngay khi render

const openEditModal = (dept: Department) => {
  setEditId(dept.id);         // ← set id trước
  reset({ name: dept.name }); // ← reset form
  setIsModalOpen(true);
};
```

---

### Layer 4: `validations/*.ts` — Zod Schema

Schema định nghĩa rules validation cho form. Được dùng bởi `zodResolver` trong react-hook-form.

```ts
// validations/department.schema.ts
export const departmentSchema = z.object({
  name: z.string().min(1, "Tên phòng ban không được để trống"),
  manager_id: z.string().optional(),
  start_time: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  end_time: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
// DepartmentFormValues = { name: string; manager_id?: string; start_time: string; end_time: string }
```

> **Quy tắc**: Type của form (`DepartmentFormValues`) luôn được infer từ schema — không bao giờ tự định nghĩa tay.

---

### Layer 5: Component — Form với react-hook-form + hooks

Đây là lớp cuối, kết hợp tất cả các lớp trên.

```tsx
// components/dashboard/departments/DepartmentMgmt.tsx (rút gọn)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDepartments, useCreateDepartment, useUpdateDepartment } from "@/hooks/useDepartments";
import { departmentSchema, type DepartmentFormValues } from "@/validations/department.schema";
import type { Department } from "@/types";

export default function DepartmentMgmt() {
  // ─── 1. Lấy dữ liệu từ hooks ───────────────────────────────────────
  const { data: departments = [], isLoading } = useDepartments();

  // ─── 2. Mutation hooks ─────────────────────────────────────────────
  const [editId, setEditId] = useState("");
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment(editId);

  // ─── 3. Form setup ─────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<DepartmentFormValues>({ resolver: zodResolver(departmentSchema) });

  // ─── 4. Submit handler ─────────────────────────────────────────────
  const onSubmit = (values: DepartmentFormValues) => {
    if (isEdit) {
      updateDepartment.mutate(values, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createDepartment.mutate(values, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  // ─── 5. JSX ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}  {/* ← Zod error message */}
      <button type="submit" disabled={isSubmitting}>Lưu</button>
    </form>
  );
}
```

**Toàn bộ luồng khi user submit form:**
```
User click "Lưu"
    │
    ▼
react-hook-form.handleSubmit()
    │ validate với zodResolver(departmentSchema)
    │ ← lỗi? hiển thị error.message dưới input, KHÔNG gọi onSubmit
    │ ← ok? gọi onSubmit(values)
    ▼
createDepartment.mutate(values)
    │ gọi fetchClient.post("/departments", values)
    │   └─ Bearer token từ Zustand store
    │   └─ Body: JSON.stringify(values)
    ▼
Backend: POST /api/v1/departments
    │
    ▼
fetchClient trả về ApiResponse<Department>
    │
    ▼
TanStack Query onSuccess:
    ├─ queryClient.invalidateQueries(["departments"]) → tự động refetch list
    ├─ toast.success("Thêm phòng ban thành công!")
    └─ setIsModalOpen(false) — đóng modal
```

---

## 🔐 Auth Flow chi tiết

```
[LoginForm.tsx]
    │ useForm + zodResolver(loginSchema)
    │ validate: employee_code required, password min 6 chars
    ▼
useLogin().mutate({ employee_code, password })
    │ fetchClient.post("/auth/login", credentials)
    ▼
Backend: POST /api/v1/auth/login
    │ returns: { token: "eyJ...", user: { id, full_name, role, ... } }
    ▼
onSuccess:
    ├─ useAuthStore.setAuth(user, token)       ← persist → localStorage("hrm-auth")
    ├─ document.cookie = "hrm-token=<token>"   ← cho proxy.ts đọc ở Edge
    ├─ queryClient.setQueryData(["auth","me"], user)
    ├─ toast.success("Chào mừng, ...")
    └─ router.push("/dashboard/overview" | "/dashboard/employees" | "/dashboard/profile")
                                               ← dựa theo role: ADMIN | MANAGER | EMPLOYEE
    ▼
[proxy.ts — Next.js Middleware chạy ở Edge]
    │ Đọc cookie "hrm-token"
    │ Decode JWT (không verify signature — chỉ đọc payload)
    │ Kiểm tra role vs route:
    │   ADMIN     → có thể vào /dashboard/* (trừ không cần thiết)
    │   MANAGER   → redirect nếu vào /dashboard/overview
    │   EMPLOYEE  → chỉ được /dashboard/profile
    │   Không token → redirect /login
    ▼
[Dashboard Layout]
    │ useCurrentUser() → đọc từ Zustand store (không gọi API)
    │ !isAuthenticated → redirect /login
    ▼
[Page Component]
    │ dùng hooks để lấy dữ liệu (useEmployees, useDepartments, ...)
    │ fetchClient tự đọc token từ Zustand, gắn vào Header
    ▼
Backend nhận Bearer token → xác thực → trả về data
```

**Logout flow:**
```
useLogout().mutate()
    ├─ useAuthStore.logout()               ← xóa token + user khỏi store + localStorage
    ├─ document.cookie = "hrm-token=; max-age=0"   ← xóa cookie
    ├─ queryClient.clear()                 ← xóa toàn bộ cache TanStack Query
    └─ router.push("/login")
```

---

## 🧩 Common Components (`src/components/ui/`)

### `<Button />`
```tsx
<Button variant="primary" size="md" isLoading={isPending}>Lưu</Button>
// variants: primary | secondary | danger | ghost
// sizes: sm | md | lg
// isLoading: hiển thị spinner, disable button
```

### `<Loading />`
```tsx
<Loading text="Đang tải dữ liệu..." fullPage />
<Loading size="sm" />   // inline spinner
```

### `<Table<T> />`
```tsx
<Table
  data={departments}
  columns={[
    { key: "name", header: "Tên phòng ban" },
    { key: "start_time", header: "Giờ vào" },
    {
      key: "actions",
      header: "Thao tác",
      render: (_, row) => (
        <button onClick={() => openEditModal(row)}>Sửa</button>
      )
    }
  ]}
  isLoading={isLoading}
  rowKey="id"
  emptyText="Chưa có phòng ban nào"
/>
```

### `<PageWrapper />`
```tsx
<PageWrapper
  title="Quản lý Phòng ban"
  actions={<Button onClick={openAddModal}>+ Thêm phòng ban</Button>}
>
  {/* children bọc trong React Suspense */}
</PageWrapper>
```

---

## 🔧 Thêm tính năng mới — Checklist

Ví dụ: thêm module **Attendance Report**.

```
1. types/index.ts
   └─ Thêm interface AttendanceReport { id, employee_id, date, check_in, check_out, ... }

2. validations/attendance.schema.ts
   └─ Tạo attendanceSchema = z.object({ date, employee_id, ... })
   └─ export type AttendanceFormValues = z.infer<typeof attendanceSchema>

3. hooks/useAttendance.ts
   └─ useAttendanceReports() — useQuery GET /attendance
   └─ useCreateAttendance() — useMutation POST /attendance
   └─ useUpdateAttendance(id) — useMutation PUT /attendance/:id
   └─ useDeleteAttendance() — useMutation DELETE /attendance/:id

4. components/dashboard/attendance/AttendanceMgmt.tsx
   └─ import hooks + schema + types
   └─ const { data } = useAttendanceReports()
   └─ const { register, handleSubmit } = useForm({ resolver: zodResolver(attendanceSchema) })
   └─ form onSubmit → createAttendance.mutate(values)

5. app/dashboard/attendance-report/page.tsx
   └─ import AttendanceMgmt
   └─ export default function Page() { return <AttendanceMgmt /> }
```

---

## 🌐 Biến môi trường

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Attendance System
```

---

## ⚠️ Những điểm cần lưu ý

| Vấn đề | Giải thích |
|--------|------------|
| `useUpdateX(id)` nhận id khi gọi hook | Phải set `editId` state TRƯỚC khi open modal |
| `is_active` trong EmployeeSchema | String `"true"/"false"` (không phải boolean) — hook tự convert trước khi gọi API |
| `useCurrentUser()` không gọi API | Chỉ đọc từ Zustand store — cần AuthProvider đã chạy `/auth/me` rồi |
| Backend không có `/auth/logout` | `useLogout()` chỉ clear client-side (store + cookie + query cache) |
| `proxy.ts` không verify JWT signature | Chỉ decode payload — không thay thế server-side auth |

