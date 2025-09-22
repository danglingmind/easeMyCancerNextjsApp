import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"

export default async function DashboardPage() {
  const role = await getCurrentUserRole()
  if (role === "admin" || role === "nutritionist") {
    redirect("/dashboard/admin/forms")
  }
  redirect("/dashboard/user")
}
