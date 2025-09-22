import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { SchemaRepository } from "@/lib/repositories/schemaRepository"

export async function POST(req: Request) {
  const { userId } = await requireAdmin()
  const { spreadsheetId, sheetName, fields } = await req.json()

  if (!spreadsheetId || !Array.isArray(fields)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  }

  const repo = new SchemaRepository()
  const latest = await repo.getLatestBySource(spreadsheetId)
  const version = (latest?.version ?? 0) + 1

  const created = await repo.create({
    connectedSourceId: spreadsheetId,
    version,
    fields,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ id: created._id, version: created.version })
}


