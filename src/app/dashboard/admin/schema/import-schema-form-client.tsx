"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Sheet {
	id: string
	name: string
	createdTime?: string
	modifiedTime?: string
	owner?: string
}

interface SheetTab {
	name: string
	sheetId: number
	index: number
}

export default function ImportSchemaFormClient({ spreadsheetId }: { spreadsheetId: string }) {
	const [availableSheets, setAvailableSheets] = useState<Sheet[]>([])
	const [selectedSheetId, setSelectedSheetId] = useState("")
	const [sheetTabs, setSheetTabs] = useState<SheetTab[]>([])
	const [selectedTab, setSelectedTab] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	// Load available spreadsheets on mount
	useEffect(() => {
		loadAvailableSheets()
	}, [])

	// Load sheet tabs when spreadsheet is selected
	useEffect(() => {
		if (selectedSheetId) {
			loadSheetTabs(selectedSheetId)
		}
	}, [selectedSheetId])

	const loadAvailableSheets = async () => {
		try {
			const res = await fetch("/api/sheets/list")
			if (!res.ok) throw new Error("Failed to load sheets")
			const data = await res.json()
			setAvailableSheets(data.sheets || [])
		} catch (err) {
			setError("Failed to load available spreadsheets")
		}
	}

	const loadSheetTabs = async (spreadsheetId: string) => {
		try {
			const res = await fetch(`/api/sheets/${spreadsheetId}/sheets`)
			if (!res.ok) throw new Error("Failed to load sheet tabs")
			const data = await res.json()
			setSheetTabs(data.sheets || [])
			// Auto-select first tab if available
			if (data.sheets?.length > 0) {
				setSelectedTab(data.sheets[0].name)
			}
		} catch (err) {
			setError("Failed to load sheet tabs")
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		try {
			if (!selectedSheetId || !selectedTab) {
				throw new Error("Please select a spreadsheet and sheet tab")
			}

			// Step 1: Import schema fields from Google Sheets
			const resImport = await fetch("/api/schema/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ spreadsheetId: selectedSheetId, sheetName: selectedTab }),
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
				body: JSON.stringify({ spreadsheetId: selectedSheetId, fields }),
			})
			if (!resSave.ok) {
				const body = await resSave.json().catch(() => ({}))
				throw new Error(body.error || "Failed to save schema")
			}

			window.location.href = `/dashboard/admin/schema?status=success&message=${encodeURIComponent(
				`Imported ${fields.length} fields from ${selectedTab}`
			)}`
		} catch (err) {
			setError(err instanceof Error ? err.message : "Import failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="spreadsheet">Select Spreadsheet</Label>
				<Select value={selectedSheetId} onValueChange={setSelectedSheetId}>
					<SelectTrigger>
						<SelectValue placeholder="Choose a spreadsheet..." />
					</SelectTrigger>
					<SelectContent>
						{availableSheets.map((sheet) => (
							<SelectItem key={sheet.id} value={sheet.id}>
								{sheet.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{selectedSheetId && (
				<div className="space-y-2">
					<Label htmlFor="sheetTab">Select Sheet Tab</Label>
					<Select value={selectedTab} onValueChange={setSelectedTab}>
						<SelectTrigger>
							<SelectValue placeholder="Choose a sheet tab..." />
						</SelectTrigger>
						<SelectContent>
							{sheetTabs.map((tab) => (
								<SelectItem key={tab.sheetId} value={tab.name}>
									{tab.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{error && (
				<div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
			)}

			<button
				type="submit"
				disabled={loading || !selectedSheetId || !selectedTab}
				className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? "Importing..." : "Import Schema"}
			</button>
		</form>
	)
}


