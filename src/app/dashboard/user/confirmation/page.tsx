"use client"
import { useRef } from "react"
import { generatePdfFromElement } from "@/lib/pdf/clientPdf"
import { useSearchParams, useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const params = useSearchParams()
  const router = useRouter()
  const data = params.get("data")
  const parsed = data ? JSON.parse(decodeURIComponent(data)) as Record<string, unknown> : {}
  const ref = useRef<HTMLDivElement | null>(null)

  const downloadPdf = async () => {
    if (ref.current) {
      await generatePdfFromElement(ref.current, "nutrition-plan.pdf")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Submission Successful</h1>
      <div ref={ref} className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-medium mb-4">Nutrition Plan Summary</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(parsed).map(([k, v]) => (
            <div key={k} className="border rounded p-3">
              <dt className="text-xs uppercase text-gray-500">{k}</dt>
              <dd className="text-sm text-gray-900">{String(v ?? "")}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex gap-3">
        <button className="rounded bg-green-600 text-white px-4 py-2" onClick={downloadPdf}>
          Download PDF
        </button>
        <button className="rounded bg-gray-200 px-4 py-2" onClick={() => router.push("/dashboard/user")}>
          Back to form
        </button>
      </div>
    </div>
  )
}


