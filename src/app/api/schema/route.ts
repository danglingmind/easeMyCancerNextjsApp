import { NextResponse } from "next/server"
import { SchemaRepository } from "@/lib/repositories/schemaRepository"

export async function GET() {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_DEFAULT_SPREADSHEET_ID" }, { status: 500 })
    }
    
    const repo = new SchemaRepository()
    const schema = await repo.getLatestBySource(spreadsheetId)
    
    return NextResponse.json({ fields: schema?.fields ?? [] })
  } catch (error) {
    console.error("Failed to load schema:", error)
    return NextResponse.json({ error: "Failed to load schema" }, { status: 500 })
  }
}
