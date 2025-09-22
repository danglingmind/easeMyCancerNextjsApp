import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { GoogleSheetsConnector } from "@/lib/connectors/googleSheets"
import { type ConnectedSourceConfig } from "@/lib/connectors/connector"

export async function POST(req: Request) {
  await requireAuth()
  const payload = await req.json()

  const spreadsheetId = process.env.NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID
  if (!spreadsheetId) {
    return NextResponse.json({ error: "missing spreadsheet configuration" }, { status: 500 })
  }

  const config: ConnectedSourceConfig = {
    id: spreadsheetId,
    type: "google-sheets",
    sourceId: spreadsheetId,
  }
  const connector = new GoogleSheetsConnector()
  const result = await connector.appendRow(config, payload)
  return NextResponse.json({ externalRowId: result.externalRowId })
}


