"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import EmployeeMgmt from "@/components/EmployeeMgmt";
import DepartmentMgmt from "@/components/DepartmentMgmt";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("profile");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const getUser = async () => {
      try {
        const res = await fetchWithAuth("/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">Đang tải...</div>
      </div>
    );
  }

  // Navigation Items Dynamic based on role
  const menuItems = [
    { id: "profile", label: "Thông tin cá nhân", icon: <FontAwesomeIcon icon={faUser} /> },
  ];

  if (user?.role === "ADMIN") {
    menuItems.push(
      { id: "employees", label: "Nhân viên", icon: <FontAwesomeIcon icon={faPeopleGroup} /> },
      { id: "departments", label: "Phòng ban", icon: <FontAwesomeIcon icon={faBuilding} /> }
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* 1. Header Area */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">HRM System</h1>
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-gray-800 font-semibold text-sm">{user?.full_name}</span>
              <span className={`text-xs font-bold ${user?.role === 'ADMIN' ? 'text-purple-600' : 'text-green-600'}`}>{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-red-200"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Split Area */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* 2. Left Vertical Navigation (Sidebar) */}
        <aside
          className={`${isSidebarOpen ? "w-64" : "w-20"} flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col relative z-0`}
        >
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-3">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center p-3 font-bold rounded-xl transition-all ${activeMenu === item.id
                      ? "bg-blue-600 text-white shadow-md font-bold"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      } ${!isSidebarOpen && "justify-center"}`}
                    title={!isSidebarOpen ? item.label : ""}
                  >
                    <span className={`text-xl ${!isSidebarOpen ? "mx-auto" : ""}`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="ml-4 truncate text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse/Expand Toggle Button at Bottom Right */}
          <div className="p-4 border-t border-gray-100 flex justify-end items-center bg-gray-50/50">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-500 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
              title={isSidebarOpen ? "Thu gọn (Collapse)" : "Mở rộng (Expand)"}
            >
              {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
          </div>
        </aside>

        {/* 3. Right Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/50">
          <div className="max-w-7xl mx-auto xl:px-8">
            {activeMenu === "profile" && (
              <div className="animate-in fade-in zoom-in-95 duration-300 ease-out">
                <EmployeeDashboard user={user} />
              </div>
            )}

            {activeMenu === "employees" && user?.role === "ADMIN" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300 ease-out">
                <EmployeeMgmt />
              </div>
            )}

            {activeMenu === "departments" && user?.role === "ADMIN" && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300 ease-out">
                <DepartmentMgmt />
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
