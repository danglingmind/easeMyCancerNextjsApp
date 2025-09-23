import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AppHeader from "@/components/AppHeader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
