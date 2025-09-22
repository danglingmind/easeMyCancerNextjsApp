import { getCurrentUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Form } from "@/types/forms"
import Link from "next/link"
import { FileText, Calendar } from "lucide-react"

export default async function UserFormsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Please sign in to view forms.</div>
  }
  
  const db = await getDatabase()
  const forms = await db.collection("forms").find({ isActive: true }).toArray() as Form[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Forms</h1>
        <p className="mt-2 text-gray-600">
          Fill out the forms below to provide your feedback
        </p>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FileText className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms available</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are currently no forms available for you to fill out.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form._id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {form.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    Created {new Date(form.createdAt).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/user/forms/${form._id}`}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Fill Form
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
