// List of email addresses that should automatically receive admin role
export const ADMIN_EMAILS = [
  "prateekreddy274@gmail.com",
] as const

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email as any)
}
