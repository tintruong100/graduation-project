"use client";

export default function profile({ user }: { user: any }) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa có thông tin";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  // Hàm hiển thị giới tính đồng bộ
  const renderGender = (gender: any) => {
    if (gender === true || gender === 1 || gender === "true") return "Nam";
    if (gender === false || gender === 0 || gender === "false") return "Nữ";
    return "Chưa có thông tin";
  };
  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Thông tin cá nhân</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Trạng thái:</span>
          <span className={`col-span-2 text-gray-800 font-semibold ${user.is_active ? "text-green-700" : "text-red-700"}`}>
            {user.is_active ? "Đang làm việc" : "Đã nghỉ việc"}
          </span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Mã nhân viên:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.employee_code}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Họ và tên:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.full_name}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Email:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.email}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Ngày sinh:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{formatDate(user.date_of_birth)}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Giới tính:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{renderGender(user.gender)}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Số điện thoại:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.phone_number || "Chưa có thông tin"}</span>
        </div>
        <div className="grid grid-cols-3 border-b border-gray-100 pb-3 items-center">
          <span className="text-gray-500 font-medium">Địa chỉ:</span>
          <span className="col-span-2 text-gray-800 font-semibold">{user.address || "Chưa có thông tin"}</span>
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
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
              user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
              {user.role}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
