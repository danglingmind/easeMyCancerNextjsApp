import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { google } from "googleapis"

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAdmin()

		const { id: spreadsheetId } = await params
		if (!spreadsheetId) {
			return NextResponse.json(
				{ error: "Spreadsheet ID required" },
				{ status: 400 }
			)
		}

		// Validate environment variables
		const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
		const privateKey = process.env.GOOGLE_PRIVATE_KEY

		if (!clientEmail || !privateKey) {
			return NextResponse.json(
				{ error: "Missing Google service account credentials" },
				{ status: 500 }
			)
		}

		// Initialize Google Sheets API
		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: clientEmail,
				private_key: privateKey.replace(/\\n/g, '\n'),
			},
			scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
		})

		const sheets = google.sheets({ version: 'v4', auth })

		// Get spreadsheet metadata to list all sheets
		const response = await sheets.spreadsheets.get({
			spreadsheetId,
			fields: 'sheets.properties'
		})

		const sheetNames = response.data.sheets?.map(sheet => ({
			name: sheet.properties?.title || 'Untitled',
			sheetId: sheet.properties?.sheetId,
			index: sheet.properties?.index
		})) || []

		return NextResponse.json({ sheets: sheetNames })

	} catch (error) {
		console.error("Error getting sheet names:", error)
		return NextResponse.json(
			{ error: "Failed to get sheet names" },
			{ status: 500 }
		)
	}
}
