# HRM System — Frontend Project Structure

> **Stack**: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Zustand · Zod · React Hook Form · React Hot Toast

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
│   ├── ui/                     # ✅ Common reusable components
│   │   ├── Button.tsx          # Variants: primary | secondary | danger | ghost
│   │   ├── Loading.tsx         # Spinner với text, fullPage mode
│   │   ├── Table.tsx           # Generic table với column definition
│   │   └── PageWrapper.tsx     # Layout chuẩn với Suspense fallback
│   ├── login/
│   │   └── LoginForm.tsx       # react-hook-form + zod validation
│   ├── layout/
│   │   └── UserProfile.tsx     # Dropdown profile + đổi mật khẩu modal
│   ├── coming-soon/
│   │   └── ComingSoon.tsx      # Placeholder cho module chưa làm
│   └── dashboard/
│       ├── overview/OverviewDashboard.tsx
│       ├── departments/DepartmentMgmt.tsx
│       ├── employees/EmployeeMgmt.tsx
│       ├── fingerprint/FingerprintMgmt.tsx
│       ├── profile/profile.tsx
│       └── scan-history/ScanLog.tsx
│
├── hooks/                      # ✅ TanStack Query hooks (data fetching)
│   ├── useAuth.ts              # useLogin, useLogout, useCurrentUser
│   ├── useDepartments.ts       # useDepartments, useCreateDepartment, ...
│   └── useEmployees.ts         # useEmployees, useCreateEmployee, ...
│
├── lib/
│   ├── fetch/
│   │   ├── client.ts           # fetchClient (cookie-based auth, auto-refresh)
│   │   └── query-client.ts     # TanStack QueryClient singleton
│   └── utils.ts                # cn() — tailwind class merger (clsx + twMerge)
│
├── providers/
│   ├── AuthProvider.tsx        # ✅ React Context cho auth state
│   └── QueryProvider.tsx       # ✅ TanStack QueryClientProvider wrapper
│
├── store/
│   └── auth.store.ts           # ✅ Zustand store — token + user persisted to localStorage
│
├── types/
│   └── index.ts                # ✅ Global TypeScript types (ApiResponse, User, Employee, ...)
│
├── utils/
│   └── api.ts                  # fetchWithAuth — token từ zustand store
│
├── validations/                # ✅ Zod schemas
│   ├── auth.schema.ts          # loginSchema
│   ├── department.schema.ts    # departmentSchema
│   └── employee.schema.ts      # employeeSchema
│
└── proxy.ts                    # ✅ Next.js Proxy (Middleware) — route protection
```

---

## 🔧 Công nghệ sử dụng

### Next.js 16 (App Router)
- **App Router**: File-based routing với `layout.tsx` lồng nhau
- **Server Components / Client Components**: Mặc định là Server Component, thêm `"use client"` khi cần interactivity
- **`proxy.ts`** (tên mới của `middleware.ts` từ Next.js 16+): Chạy ở Edge, bảo vệ routes trước khi page render

### React 19
- **`Suspense`**: Dùng trong `PageWrapper` để hiển thị fallback loading khi lazy load
- **`useEffect` + `useState`**: Giữ nguyên pattern data fetching trong từng component

### Zustand (`@/store/auth.store.ts`)
- **`createJSONStorage(localStorage)`**: Token và user info được persist vào localStorage dưới key `hrm-auth`
- **`useAuthStore.getState()`**: Đọc store ngoài React component (e.g., trong `fetchWithAuth`)
- **Thay thế**: `localStorage.getItem("token")` → `useAuthStore.getState().token`

```ts
// Trước
const token = localStorage.getItem("token");

// Sau
const token = useAuthStore.getState().token;
```

### TanStack Query v5 (`@tanstack/react-query`)
- **`useQuery`**: Data fetching với caching, stale-time, auto-refetch
- **`useMutation`**: Mutation (POST/PUT/DELETE) với `onSuccess` / `onError` callbacks
- **`queryClient.invalidateQueries`**: Tự động refetch sau khi mutation thành công
- Được cấu hình trong `QueryProvider.tsx`, không retry khi lỗi 401/403/404

### Zod (`zod`) + React Hook Form (`react-hook-form`)
- **`zodResolver`**: Bridge giữa Zod schema và React Hook Form
- **Validation**: Chạy client-side trước khi gọi API, hiển thị lỗi inline ngay dưới input
- Dùng trong `LoginForm.tsx`, sẵn sàng mở rộng cho các form khác

```ts
// Định nghĩa schema
const loginSchema = z.object({
  employee_code: z.string().min(1),
  password: z.string().min(6),
});

// Trong component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### React Hot Toast (`react-hot-toast`)
- Thay thế `alert()` / `window.alert()` bằng toast notification đẹp hơn
- Được mount trong `RootLayout` qua `<Toaster position="top-right" />`
- Sử dụng: `toast.success("...")`, `toast.error("...")`

### `fetchClient` vs `fetchWithAuth`
| | `fetchWithAuth` (utils/api.ts) | `fetchClient` (lib/fetch/client.ts) |
|---|---|---|
| Auth | Bearer token từ Zustand store | httpOnly cookie (credentials: include) |
| Response | Raw `Response` object | Parsed `ApiResponse<T>` |
| 401 handling | Thủ công | Auto-refresh với queue |
| Dùng trong | Component hiện tại (legacy) | Hooks mới (useLogin, etc.) |

> **Chiến lược migration**: Các component hiện tại tiếp tục dùng `fetchWithAuth`. Các hooks mới và feature mới dùng `fetchClient`.

### Tailwind CSS 4
- **`cn()` utility**: Kết hợp `clsx` + `tailwind-merge` để merge class an toàn

---

## 🔐 Luồng xác thực (Auth Flow)

```
[Login Form]
    │ useLogin() mutation
    ▼
[POST /auth/login]
    │ response: { token, user }
    ▼
[Zustand setAuth(user, token)]     ← persist to localStorage("hrm-auth")
[cookie: hrm-token=...]            ← đọc bởi proxy.ts (middleware)
    │
    ▼
[Redirect → /dashboard]
    │
    ▼
[proxy.ts] ← đọc cookie hrm-token, decode JWT, kiểm tra role
    │ ADMIN → /dashboard/overview ✅
    │ EMPLOYEE → /dashboard/profile ✅
    │ Không có token → redirect /login
```

---

## 🧩 Common Components (`src/components/ui/`)

### `<Button />`
```tsx
<Button variant="primary" size="md" isLoading={isPending}>
  Đăng nhập
</Button>
// variants: primary | secondary | danger | ghost
// sizes: sm | md | lg
```

### `<Loading />`
```tsx
<Loading text="Đang tải..." fullPage size="lg" />
```

### `<Table<T> />`
```tsx
<Table
  data={departments}
  columns={[
    { key: "name", header: "Tên phòng ban" },
    { key: "actions", header: "Thao tác", render: (_, row) => <Actions id={row.id} /> }
  ]}
  isLoading={isLoading}
  rowKey="id"
/>
```

### `<PageWrapper />`
```tsx
<PageWrapper
  title="Quản lý Phòng ban"
  actions={<Button onClick={openModal}>+ Thêm</Button>}
>
  {/* Nội dung trang — được bọc trong Suspense */}
</PageWrapper>
```

---

## 🌐 Biến môi trường

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Attendance System
```
