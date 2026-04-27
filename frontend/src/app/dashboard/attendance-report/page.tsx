import AttendanceMgmt from "@/components/dashboard/attendance-report/AttendanceMgmt";

export const metadata = {
    title: "Báo cáo chấm công | HRM System",
    description: "Xem và quản lý dữ liệu điểm danh hàng ngày/tháng",
};

export default function AttendanceReportPage() {
    return (
        <div className="w-full space-y-4">
            {/* Nếu bạn có component <PageWrapper> thì bọc ở đây. 
        Tạm thời mình để div trống bao ngoài cho chuẩn layout.
      */}
            <AttendanceMgmt />
        </div>
    );
}