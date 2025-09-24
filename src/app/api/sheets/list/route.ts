import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { google } from "googleapis"

export async function GET() {
	try {
		await requireAdmin()

		// Validate environment variables
		const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
		const privateKey = process.env.GOOGLE_PRIVATE_KEY

		if (!clientEmail || !privateKey) {
			return NextResponse.json(
				{ error: "Missing Google service account credentials" },
				{ status: 500 }
			)
		}

		// Initialize Google Drive API
		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: clientEmail,
				private_key: privateKey.replace(/\\n/g, '\n'),
			},
			scopes: [
				'https://www.googleapis.com/auth/drive.readonly',
				'https://www.googleapis.com/auth/spreadsheets.readonly'
			],
		})

		const drive = google.drive({ version: 'v3', auth })

		// List all Google Sheets files
		const response = await drive.files.list({
			q: "mimeType='application/vnd.google-apps.spreadsheet'",
			fields: 'files(id,name,createdTime,modifiedTime,owners)',
			orderBy: 'modifiedTime desc',
			pageSize: 100
		})

		const sheets = response.data.files?.map(file => ({
			id: file.id,
			name: file.name,
			createdTime: file.createdTime,
			modifiedTime: file.modifiedTime,
			owner: file.owners?.[0]?.displayName || 'Unknown'
		})) || []

		return NextResponse.json({ sheets })

	} catch (error) {
		console.error("Error listing sheets:", error)
		return NextResponse.json(
			{ error: "Failed to list spreadsheets" },
			{ status: 500 }
		)
	}
}
