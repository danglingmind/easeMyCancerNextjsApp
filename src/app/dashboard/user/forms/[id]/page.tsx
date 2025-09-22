"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Survey } from "survey-react-ui"
import { Model } from "survey-core"

export default function FormPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}`)
        if (!response.ok) {
          throw new Error("Form not found")
        }
        const formData = await response.json()
        setForm(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchForm()
    }
  }, [params.id])

  const handleComplete = async (survey: any) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: params.id,
          userId: "user", // TODO: Get from auth
          response: survey.data,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit response")
      }

      // Show success message and redirect
      alert("Form submitted successfully!")
      router.push("/dashboard/user/forms")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push("/dashboard/user/forms")}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Forms
        </button>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Form not found</p>
      </div>
    )
  }

  const survey = new Model(form.schema)
  survey.onComplete.add(handleComplete)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
        <p className="mt-2 text-gray-600">{form.description}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <Survey model={survey} />
      </div>

      {submitting && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Submitting form...</p>
        </div>
      )}
    </div>
  )
}
