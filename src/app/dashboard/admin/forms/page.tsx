import { requireAdmin } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Form } from "@/types/forms"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Download } from "lucide-react"

export default async function AdminFormsPage() {
  await requireAdmin()
  
  const db = await getDatabase()
  const forms = await db.collection<Form>("forms").find({}).toArray()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms Management</h1>
          <p className="mt-2 text-gray-600">
            Create, edit, and manage your feedback forms
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new form.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard/admin/forms/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Form
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form._id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {form.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    form.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {form.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/admin/forms/${form._id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/dashboard/admin/forms/${form._id}/export`}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
