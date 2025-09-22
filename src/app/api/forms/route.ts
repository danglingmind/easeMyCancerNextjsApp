import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { CreateFormData } from "@/types/forms"

export async function GET() {
  try {
    const db = await getDatabase()
    const forms = await db.collection("forms").find({}).toArray()
    
    return NextResponse.json(forms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body: CreateFormData = await request.json()
    const { title, description, schema } = body
    
    if (!title || !description || !schema) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const form = {
      title,
      description,
      schema,
      createdBy: "admin", // TODO: Get from auth
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }
    
    const result = await db.collection("forms").insertOne(form)
    
    return NextResponse.json(
      { id: result.insertedId, ...form },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    )
  }
}
