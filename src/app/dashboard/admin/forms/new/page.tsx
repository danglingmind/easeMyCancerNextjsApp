"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { assertDefined } from "@/lib/utils"
import { type SchemaField } from "@/lib/connectors/connector"

export default function NewFormPage() {
  const router = useRouter()
  const [spreadsheetId, setSpreadsheetId] = useState("")
  const [sheetName, setSheetName] = useState("")
  const [fields, setFields] = useState<SchemaField[]>([])

  const importHeaders = async () => {
    assertDefined(spreadsheetId, "Spreadsheet ID is required")
    const res = await fetch("/api/schema/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetId, sheetName }),
    })
    if (!res.ok) {
      alert("Failed to import schema")
      return
    }
    const data = await res.json()
    setFields(data.fields)
  }

  const saveSchema = async () => {
    const res = await fetch("/api/schema/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetId, sheetName, fields }),
    })
    if (res.ok) {
      router.push("/dashboard/admin/forms")
    } else {
      alert("Failed to save schema")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Connect Google Sheet (Nutrition Plan)</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Spreadsheet ID"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Sheet name (optional)"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
        />
      </div>

      <button className="rounded bg-blue-600 text-white px-4 py-2" onClick={importHeaders}>
        Import header row as schema
      </button>

      {fields.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Fields</h2>
          {fields.map((f, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-4 items-center">
              <input
                className="border rounded px-2 py-1"
                value={f.label}
                onChange={(e) => {
                  const copy = [...fields]
                  copy[idx] = { ...copy[idx], label: e.target.value }
                  setFields(copy)
                }}
              />
              <select
                className="border rounded px-2 py-1"
                value={f.type}
                onChange={(e) => {
                  const copy = [...fields]
                  copy[idx] = { ...copy[idx], type: e.target.value as any }
                  setFields(copy)
                }}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="date">date</option>
                <option value="boolean">boolean</option>
              </select>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!f.required}
                  onChange={(e) => {
                    const copy = [...fields]
                    copy[idx] = { ...copy[idx], required: e.target.checked }
                    setFields(copy)
                  }}
                />
                <span>Required</span>
              </label>
              <span className="text-xs text-gray-500">Column: {f.columnRef}</span>
            </div>
          ))}
          <button className="rounded bg-green-600 text-white px-4 py-2" onClick={saveSchema}>
            Save schema
          </button>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
// import { requireAdmin } from "@/lib/auth"

export default function NewFormPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schema: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      let schema
      try {
        schema = JSON.parse(formData.schema)
      } catch {
        throw new Error("Invalid JSON format for schema")
      }

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          schema,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create form")
      }

      router.push("/dashboard/admin/forms")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const jsonData = JSON.parse(content)
          setFormData(prev => ({
            ...prev,
            schema: JSON.stringify(jsonData, null, 2)
          }))
        } catch (error) {
          setError("Invalid JSON file")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
        <p className="mt-2 text-gray-600">
          Upload a SurveyJS JSON file or create a form manually
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Form Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter form title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter form description"
          />
        </div>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Upload SurveyJS JSON File
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".json"
            onChange={handleFileUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload a JSON file exported from SurveyJS Creator
          </p>
        </div>

        <div>
          <label htmlFor="schema" className="block text-sm font-medium text-gray-700">
            Form Schema (JSON)
          </label>
          <textarea
            id="schema"
            required
            rows={15}
            value={formData.schema}
            onChange={(e) => setFormData(prev => ({ ...prev, schema: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
            placeholder="Paste your SurveyJS JSON schema here"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the SurveyJS JSON schema for your form
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Form"}
          </button>
        </div>
      </form>
    </div>
  )
}
