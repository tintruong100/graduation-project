"use client";
import { useState } from "react";
import EmployeeMgmt from "./EmployeeMgmt";
import DepartmentMgmt from "./DepartmentMgmt";

export default function AdminDashboard({ user }: { user: any }) {
  const [tab, setTab] = useState("employees");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md min-h-[600px]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển Admin</h2>
        <div>
          <span className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-sm">Role: {user.role}</span>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          className={`py-2 px-4 font-semibold text-sm rounded-t-lg transition-colors ${tab === "employees" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          onClick={() => setTab("employees")}
        >
          Quản lý Nhân Viên
        </button>
        <button
          className={`py-2 px-4 font-semibold text-sm rounded-t-lg transition-colors ${tab === "departments" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          onClick={() => setTab("departments")}
        >
          Quản lý Phòng Ban
        </button>
      </div>

      <div>
        {tab === "employees" && <EmployeeMgmt />}
        {tab === "departments" && <DepartmentMgmt />}
      </div>
    </div>
  );
}
