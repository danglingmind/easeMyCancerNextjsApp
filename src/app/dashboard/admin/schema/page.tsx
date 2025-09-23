import { requireAdmin } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { SchemaRepository } from "@/lib/repositories/schemaRepository"
import { GoogleSheetsConnector } from "@/lib/connectors/googleSheets"
import { type ConnectedSourceConfig } from "@/lib/connectors/connector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImportSchemaFormClient from "./import-schema-form-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Save, Trash2, Download } from "lucide-react"
import { Suspense } from "react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function SchemaManagementPage({
	searchParams,
}: {
	searchParams?: { status?: string; message?: string }
}) {
	await requireAdmin()

	const schemaRepo = new SchemaRepository()
	const defaultSpreadsheetId = process.env.NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID

	if (!defaultSpreadsheetId) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Schema Management</h1>
					<p className="text-red-600">Please configure NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID in your environment variables.</p>
				</div>
			</div>
		)
	}

	// Get current schema
	const currentSchema = await schemaRepo.getLatestBySource(defaultSpreadsheetId)

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Schema Management</h1>
					<p className="mt-2 text-gray-600">
						Import and edit form schemas from your Google Sheets
					</p>
				</div>
				<ImportSchemaDialog spreadsheetId={defaultSpreadsheetId} />
			</div>

			{searchParams?.status === "success" && (
				<div className="rounded-md bg-green-50 p-4">
					<div className="text-sm text-green-800">
						{searchParams?.message || "Schema imported successfully."}
					</div>
				</div>
			)}

			{searchParams?.status === "error" && (
				<div className="rounded-md bg-red-50 p-4">
					<div className="text-sm text-red-700">
						{searchParams?.message || "Failed to import schema. Check configuration."}
					</div>
				</div>
			)}

			{currentSchema ? (
				<Card>
					<CardHeader>
						<CardTitle>Current Schema</CardTitle>
						<CardDescription>
							Version {currentSchema.version} - Last updated {new Date(currentSchema.createdAt).toLocaleDateString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SchemaEditor schema={currentSchema} />
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="text-center py-12">
						<h3 className="text-lg font-medium text-gray-900 mb-2">No Schema Found</h3>
						<p className="text-gray-600 mb-4">
							Import a schema from your Google Sheet to get started.
						</p>
						<ImportSchemaDialog spreadsheetId={defaultSpreadsheetId} />
					</CardContent>
				</Card>
			)}
		</div>
	)
}

async function ImportSchemaDialog({ spreadsheetId }: { spreadsheetId: string }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Import Schema
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Import Schema from Google Sheet</DialogTitle>
					<DialogDescription>
						Import the header row from your Google Sheet to create a form schema.
					</DialogDescription>
				</DialogHeader>
				<ImportSchemaFormClient spreadsheetId={spreadsheetId} />
			</DialogContent>
		</Dialog>
	)
}

// Replaced by client component for reliability across environments

async function SchemaEditor({ schema }: { schema: any }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="text-lg font-medium">Schema Fields</h4>
				<Button variant="outline" size="sm">
					<Edit className="mr-2 h-4 w-4" />
					Edit Schema
				</Button>
			</div>
			
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Field Name</TableHead>
						<TableHead>Label</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Required</TableHead>
						<TableHead>Column Reference</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{schema.fields.map((field: any, index: number) => (
						<TableRow key={index}>
							<TableCell className="font-medium">{field.key}</TableCell>
							<TableCell>{field.label}</TableCell>
							<TableCell>
								<Select defaultValue={field.type}>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="string">String</SelectItem>
										<SelectItem value="number">Number</SelectItem>
										<SelectItem value="date">Date</SelectItem>
										<SelectItem value="boolean">Boolean</SelectItem>
										<SelectItem value="enum">Enum</SelectItem>
									</SelectContent>
								</Select>
							</TableCell>
							<TableCell>
								<Checkbox checked={field.required} />
							</TableCell>
							<TableCell className="text-sm text-gray-500">{field.columnRef}</TableCell>
							<TableCell>
								<Button variant="ghost" size="sm">
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

async function importSchemaAction(formData: FormData) {
	"use server"
	
	const spreadsheetId = formData.get("spreadsheetId") as string
	const sheetName = formData.get("sheetName") as string || "Sheet1"
	
	try {
		// Validate env config first for better feedback
		const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
		const privateKey = process.env.GOOGLE_PRIVATE_KEY
		if (!clientEmail || !privateKey) {
			redirect(`/dashboard/admin/schema?status=error&message=${encodeURIComponent("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY")}`)
		}

		const config: ConnectedSourceConfig = {
			id: spreadsheetId,
			type: "google-sheets",
			sourceId: spreadsheetId,
			sheetName,
		}
		
		const connector = new GoogleSheetsConnector()
		const schema = await connector.readSchema(config)
		
		const schemaRepo = new SchemaRepository()
		await schemaRepo.create({
			connectedSourceId: spreadsheetId,
			version: 1,
			fields: schema.fields,
			createdBy: "admin", // TODO: Get from auth
			createdAt: new Date().toISOString(),
		})
		
		// Refresh and show success banner
		revalidatePath('/dashboard/admin/schema')
		redirect(`/dashboard/admin/schema?status=success&message=${encodeURIComponent(`Imported ${schema.fields.length} fields from ${sheetName}`)}`)
	} catch (error) {
		console.error("Error importing schema:", error)
		const message = error instanceof Error ? error.message : 'Failed to read schema from Google Sheets'
		redirect(`/dashboard/admin/schema?status=error&message=${encodeURIComponent(message)}`)
	}
}


