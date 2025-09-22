import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Ease My Cancer Forms
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard/admin/forms" className="text-sm text-gray-600 hover:text-gray-900 mr-4">Admin</Link>
              <Link href="/dashboard/user" className="text-sm text-gray-600 hover:text-gray-900">My Forms</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
