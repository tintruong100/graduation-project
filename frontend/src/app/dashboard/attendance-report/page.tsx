import { type Metadata } from "next";
import ComingSoon from "@/components/coming-soon/ComingSoon";

export const metadata: Metadata = { title: "Báo cáo chấm công" };

export default function AttendanceReportPage() {
    return (
        <ComingSoon
            title="Báo cáo chấm công đang phát triển..."
            description="Hệ thống tổng hợp dữ liệu chấm công sẽ sớm có mặt tại đây!"
        />
    );
}