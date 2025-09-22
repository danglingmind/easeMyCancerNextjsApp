import { auth, currentUser } from "@clerk/nextjs/server"
import { type UserRole } from "@/types/auth"
import { isAdminEmail } from "@/config/admin-emails"

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  // Prefer role from session claims to avoid extra fetch
  const claimRole = (sessionClaims?.metadata as { role?: UserRole } | undefined)?.role
  if (claimRole) return claimRole

  // Fallback to Clerk currentUser API (works in both Node and Edge runtimes)
  const user = await currentUser()
  
  // Check if user email is in admin list - auto-assign admin role
  if (user?.emailAddresses?.[0]?.emailAddress && isAdminEmail(user.emailAddresses[0].emailAddress)) {
    return "admin"
  }
  
  const role = (user?.publicMetadata as { role?: UserRole } | undefined)?.role
  return role ?? null
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }
  return userId
}

export async function requireRole(required: UserRole): Promise<{ userId: string; role: UserRole }>
{
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const role = await getCurrentUserRole()
  if (!role || role !== required) {
    throw new Error("Forbidden")
  }
  return { userId, role }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === "admin"
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await requireRole("admin")
  return { userId }
}
