import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { GoogleSheetsConnector } from "@/lib/connectors/googleSheets"
import { type ConnectedSourceConfig, type SchemaField } from "@/lib/connectors/connector"

export async function POST(req: Request) {
  await requireAdmin()
  const { spreadsheetId, sheetName } = await req.json()
  if (!spreadsheetId) {
    return NextResponse.json({ error: "spreadsheetId required" }, { status: 400 })
  }

  // Placeholder: synthesize fields from header row later
  const config: ConnectedSourceConfig = {
    id: spreadsheetId,
    type: "google-sheets",
    sourceId: spreadsheetId,
    sheetName,
  }
  const connector = new GoogleSheetsConnector()
  const schema = await connector.readSchema(config)

  const fields: SchemaField[] = schema.fields
  return NextResponse.json({ fields })
}


