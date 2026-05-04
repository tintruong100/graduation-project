// ─── Generic API Response Wrapper ────────────────────────────────────────────
// Backend trả về: { success: boolean, message: string, data: T }
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

/** User object trả về từ POST /auth/login (subset) */
export interface LoginUser {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  position?: string;
}

/** User object đầy đủ từ GET /auth/me */
export interface AuthUser {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  department?: { id: string; name: string };
  avatar?: string;
  is_active: boolean;
  position?: string;
  date_of_birth?: string;
  gender?: boolean;
  phone_number?: string;
  address?: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

/** Union type — LoginUser (ngay sau login) hoặc AuthUser (sau khi /auth/me) */
export type AnyUser = LoginUser | AuthUser;

// ─── Department ───────────────────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  manager?: {
    id: string;
    full_name: string;
    employee_code: string;
  };
  employees?: Employee[];
  start_time: string;
  end_time: string;
}

// ─── Employee ─────────────────────────────────────────────────────────────────
export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  role: UserRole;
  gender: boolean;
  date_of_birth?: string;
  phone_number?: string;
  address?: string;
  position?: string;
  custom_start_time?: string;
  custom_end_time?: string;
  is_active: boolean;
  department?: {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
  };
}

// ─── Attendance / Scan ────────────────────────────────────────────────────────
export interface ScanLog {
  id: string;
  employee_id: string;
  employee?: Pick<Employee, "id" | "full_name" | "employee_code">;
  scan_time: string;
  device_id?: string;
  status?: string;
  image_path?: string;
  type?: "CHECK_IN" | "CHECK_OUT";
}

export interface AttendanceReport {
  id: string;
  employee_id: string;
  employee?: Pick<Employee, "id" | "full_name" | "employee_code">;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EARLY_LEAVE";
  work_hours?: number;
}

// ─── Leave / OT ───────────────────────────────────────────────────────────────
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveType = "ANNUAL" | "SICK" | "UNPAID" | "OVERTIME";

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee?: Pick<Employee, "id" | "full_name" | "employee_code">;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  created_at: string;
}

// ─── Fingerprint ──────────────────────────────────────────────────────────────
export interface Fingerprint {
  id: string;
  employee_id: string;
  employee?: Pick<Employee, "id" | "full_name" | "employee_code">;
  finger_name: string;
  sensor_id?: number;
  template_data?: string;
  is_active?: boolean;
  createdAt?: string;
}

export interface AttendanceSummary {
  id: string;
  employee_id: string;
  work_date: string; // Định dạng YYYY-MM-DD
  first_scan_time: string | null;
  last_scan_time: string | null;
  late_minutes: number;
  early_leave_minutes: number;
  gross_work_hours: number;
  break_hours: number;
  net_work_hours: number;
  total_scans: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'MISSING_OUT';
  is_manually_edited: boolean;
  edit_note: string | null;

  // Dữ liệu join (include) từ bảng Employee mà Backend trả về nhờ "nest: true"
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
    department?: {
      id: string;
      name: string;
    }
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────
export interface DashboardSummary {
  today: {
    total: number;
    active: number;
    department_count: number;
    male_count: number;
    female_count: number;
    present: number;
    late: number;
    absent: number;
    missing_out: number;
  };
  recent_scans: ScanLog[];
  device_status: {
    is_online: boolean;
    last_active: string | null;
  };
}