import { auth, currentUser } from "@clerk/nextjs/server"
import { type UserRole } from "@/types/auth"
import { isAdminEmail } from "@/config/admin-emails"

// Valid roles for type safety
const VALID_ROLES: UserRole[] = ["admin", "nutritionist", "end-user"]

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  // Log the role claim from JWT token
  console.log("🔍 JWT Role Claim Debug:")
  console.log("  - sessionClaims:", sessionClaims)
  console.log("  - role claim value:", sessionClaims?.role)
  console.log("  - role type:", typeof sessionClaims?.role)

  // Extract role from JWT token session claims (primary method)
  const role = sessionClaims?.role as UserRole | undefined
  if (role && VALID_ROLES.includes(role)) {
    console.log("  ✅ Using role from JWT:", role)
    return role
  }

  // Fallback: Check if user email is in admin list - auto-assign admin role
  const user = await currentUser()
  if (user?.emailAddresses?.[0]?.emailAddress && isAdminEmail(user.emailAddresses[0].emailAddress)) {
    console.log("  🔄 Fallback: Using admin role from email")
    return "admin"
  }
  
  // Default role for authenticated users
  console.log("  🔄 Default: Using end-user role")
  return "end-user"
}

// Helper function to check if a role is valid
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole)
}

// Helper function to get user info with role
export async function getCurrentUserWithRole() {
  const { userId } = await auth()
  if (!userId) return null
  
  const user = await currentUser()
  const role = await getCurrentUserRole()
  
  return {
    id: userId,
    email: user?.emailAddresses?.[0]?.emailAddress,
    role,
    user
  }
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

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null
  
  const user = await currentUser()
  return user
}
