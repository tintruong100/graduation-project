import { type Metadata } from "next";
import EmployeeMgmt from "@/components/dashboard/employees/EmployeeMgmt";

export const metadata: Metadata = { title: "Quản lý Nhân viên" };

export default function EmployeesPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EmployeeMgmt />
        </div>
    );
}