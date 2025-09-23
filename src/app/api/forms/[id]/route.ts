import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { requireAdmin } from "@/lib/auth"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAdmin()
		const { id } = await params
		const db = await getDatabase()
		const form = await db.collection("forms").findOne({ _id: new ObjectId(id) })
		if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 })
		return NextResponse.json(form)
	} catch (error) {
		console.error("Error fetching form:", error)
		return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAdmin()
		const { id } = await params
		const body = await req.json()
		const { title, description, schema } = body
		if (!title || !description || !schema) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 })
		}
		const db = await getDatabase()
		const result = await db.collection("forms").updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { title, description, schema, updatedAt: new Date().toISOString() } }
		)
		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Not found" }, { status: 404 })
		}
		return NextResponse.json({ ok: true })
	} catch (error) {
		console.error("Error updating form:", error)
		return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAdmin()
		const { id } = await params
		const db = await getDatabase()
		const result = await db.collection("forms").deleteOne({ _id: new ObjectId(id) })
		if (result.deletedCount === 0) {
			return NextResponse.json({ error: "Not found" }, { status: 404 })
		}
		return NextResponse.json({ ok: true })
	} catch (error) {
		console.error("Error deleting form:", error)
		return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
	}
}
