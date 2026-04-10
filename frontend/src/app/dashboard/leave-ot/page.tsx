import { type Metadata } from "next";
import ComingSoon from "@/components/coming-soon/ComingSoon";

export const metadata: Metadata = { title: "Nghỉ phép & Tăng ca" };

export default function LeaveOTPage() {
    return (
        <ComingSoon
            title="Quản lý nghỉ phép và tăng ca đang phát triển..."
            description="Hệ thống đăng kí nghỉ phép và tăng ca sẽ sớm có mặt tại đây!"
        />
    );
}