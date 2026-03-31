import { redirect } from "next/navigation";

export default function DashboardIndex() {
    // Bất cứ ai vào thẳng /dashboard sẽ bị bê ngay sang /dashboard/profile
    redirect("/dashboard/profile");
}