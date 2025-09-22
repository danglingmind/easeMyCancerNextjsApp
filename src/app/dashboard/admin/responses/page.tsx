import { requireAdmin } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Form } from "@/types/forms"
import Link from "next/link"
import { Download, Eye } from "lucide-react"

export default async function AdminResponsesPage() {
  await requireAdmin()
  
  const db = await getDatabase()
  const forms = await db.collection("forms").find({}).toArray() as Form[]

  // Get response counts for each form
  const formsWithCounts = await Promise.all(
    forms.map(async (form) => {
      const count = await db.collection("responses").countDocuments({
        formId: form._id
      })
      return { ...form, responseCount: count }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
        <p className="mt-2 text-gray-600">
          View and export responses for all forms
        </p>
      </div>

      {formsWithCounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create forms to start collecting responses.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {formsWithCounts.map((form) => (
              <li key={form._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
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
                    <p className="mt-1 text-sm text-gray-600">
                      {form.description}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">{form.responseCount}</span>
                      <span className="ml-1">
                        {form.responseCount === 1 ? 'response' : 'responses'}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/forms/${form._id}/responses`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                    {form.responseCount > 0 && (
                      <a
                        href={`/api/forms/${form._id}/export`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
