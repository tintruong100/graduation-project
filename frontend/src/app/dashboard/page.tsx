import { redirect } from "next/navigation";

/**
 * /dashboard root — middleware handles the real redirect based on role.
 * This page is only reached if middleware is bypassed (e.g., direct server call).
 * Safe fallback: redirect to profile.
 */
export default function DashboardIndex() {
    redirect("/dashboard/profile");
}