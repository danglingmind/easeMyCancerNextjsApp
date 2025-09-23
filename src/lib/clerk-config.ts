import { type UserRole } from "@/types/auth"
import { isAdminEmail } from "@/config/admin-emails"

// This function will be used by Clerk to customize session tokens
export function getSessionClaims(user: { id: string; emailAddresses?: Array<{ emailAddress: string }>; publicMetadata?: Record<string, unknown> }) {
  // Determine role based on email or public metadata
  let role: UserRole = "end-user" // default role
  
  // Check if user email is in admin list
  if (user?.emailAddresses?.[0]?.emailAddress && isAdminEmail(user.emailAddresses[0].emailAddress)) {
    role = "admin"
  } else if (user?.publicMetadata?.role) {
    // Use role from public metadata if set
    role = user.publicMetadata.role as UserRole
  }
  
  return {
    role,
    // Add any other custom claims you need
    userId: user.id,
    email: user.emailAddresses?.[0]?.emailAddress,
  }
}
