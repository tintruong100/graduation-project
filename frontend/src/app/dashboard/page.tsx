import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardIndex() {
    const cookieStore = await cookies();
    const token = cookieStore.get("hrm-token")?.value;

    if (!token) {
        redirect("/login");
    }

    // Decode role from JWT payload to route to the right landing page
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64url").toString()
        );
        const role: string = payload.role;

        if (role === "ADMIN") {
            redirect("/dashboard/overview");
        } else if (role === "MANAGER") {
            redirect("/dashboard/employees");
        }
    } catch {
        // Malformed token - redirect to profile as safe default
    }

    redirect("/dashboard/profile");
}