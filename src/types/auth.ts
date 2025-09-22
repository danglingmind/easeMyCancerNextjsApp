export type UserRole = "admin" | "nutritionist" | "end-user"

export interface User {
  id: string
  clerkId: string
  role: UserRole
  createdAt: string
  updatedAt?: string
}
