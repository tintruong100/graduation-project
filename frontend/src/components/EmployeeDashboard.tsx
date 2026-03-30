"use client";

export default function EmployeeDashboard({ user }: { user: any }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Thông tin cá nhân</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Họ và tên:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.full_name}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Mã nhân viên:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.employee_code}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Email:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.email}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Chức vụ:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.position || "Chưa có chức vụ"}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Phòng ban:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.department?.name || "Chưa phân bổ"}</span>
        </div>
        <div className="grid grid-cols-3 pb-2 items-center">
          <span className="text-gray-500 font-medium">Vai trò:</span>
          <span className="col-span-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {user.role}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
