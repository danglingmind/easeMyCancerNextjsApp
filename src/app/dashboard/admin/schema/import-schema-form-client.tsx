"use client"

import { useState } from "react"

export default function ImportSchemaFormClient({ spreadsheetId }: { spreadsheetId: string }) {
	const [sheetName, setSheetName] = useState("Sheet1")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		try {
			// Step 1: Import schema fields from Google Sheets
			const resImport = await fetch("/api/schema/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ spreadsheetId, sheetName }),
			})
			if (!resImport.ok) {
				const body = await resImport.json().catch(() => ({}))
				throw new Error(body.error || "Failed to import schema from Google Sheets")
			}
			const { fields } = await resImport.json()
			if (!Array.isArray(fields)) throw new Error("Invalid schema fields returned")

			// Step 2: Save schema in DB (versioned)
			const resSave = await fetch("/api/schema/save", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ spreadsheetId, fields }),
			})
			if (!resSave.ok) {
				const body = await resSave.json().catch(() => ({}))
				throw new Error(body.error || "Failed to save schema")
			}

			window.location.href = `/dashboard/admin/schema?status=success&message=${encodeURIComponent(
				`Imported ${fields.length} fields from ${sheetName}`
			)}`
		} catch (err) {
			setError(err instanceof Error ? err.message : "Import failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<input type="hidden" name="spreadsheetId" value={spreadsheetId} />
			<div className="space-y-2">
				<label htmlFor="sheetName" className="text-sm font-medium">Sheet Name</label>
				<input
					id="sheetName"
					name="sheetName"
					placeholder="Sheet1"
					value={sheetName}
					onChange={(e) => setSheetName(e.target.value)}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
				/>
			</div>

			{error && (
				<div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
			)}

			<button
				type="submit"
				disabled={loading}
				className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? "Importing..." : "Import Schema"}
			</button>
		</form>
	)
}


