import { type Metadata } from "next";
import DepartmentMgmt from "@/components/dashboard/departments/DepartmentMgmt";

export const metadata: Metadata = { title: "Quản lý Phòng ban" };

export default function DepartmentsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DepartmentMgmt />
        </div>
    );
}