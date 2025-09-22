"use client"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { SchemaRepository } from "@/lib/repositories/schemaRepository"
import { type SchemaField } from "@/lib/connectors/connector"
import { useRouter } from "next/navigation"

export default function UserFormPage() {
  const router = useRouter()
  const [fields, setFields] = useState<SchemaField[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const spreadsheetId = process.env.NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID
        if (!spreadsheetId) {
          setError("Missing NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID")
          return
        }
        const repo = new SchemaRepository()
        const schema = await repo.getLatestBySource(spreadsheetId)
        setFields(schema?.fields ?? [])
      } catch (e) {
        setError("Failed to load schema")
      }
    }
    void load()
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {}
    ;(fields ?? []).forEach((f) => {
      payload[f.key] = formData.get(f.key)
    })
    const res = await fetch("/api/forms/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const submitted = await res.json()
      const encoded = encodeURIComponent(JSON.stringify(payload))
      router.push(`/dashboard/user/confirmation?row=${submitted.externalRowId}&data=${encoded}`)
    }
  }

  if (error) return <div className="text-red-600">{error}</div>
  if (!fields) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nutrition Plan Form</h1>
      <form className="space-y-4" onSubmit={submit}>
        {fields.map((f) => (
          <div key={f.key} className="grid gap-1">
            <label className="text-sm font-medium">{f.label}</label>
            <input className="border rounded px-3 py-2" name={f.key} required={!!f.required} />
          </div>
        ))}
        <button className="rounded bg-blue-600 text-white px-4 py-2" type="submit">Submit</button>
      </form>
    </div>
  )
}


