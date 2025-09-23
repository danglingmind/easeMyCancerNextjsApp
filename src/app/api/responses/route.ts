import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { CreateResponseData } from "@/types/responses"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    
    const body: CreateResponseData = await request.json()
    const { formId, response } = body
    
    if (!formId || !response) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    
    // Verify form exists and is active
    const form = await db.collection("forms").findOne({
      _id: new ObjectId(formId),
      isActive: true
    })
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found or inactive" },
        { status: 404 }
      )
    }
    
    const responseData = {
      formId,
      userId,
      response,
      submittedAt: new Date().toISOString(),
    }
    
    const result = await db.collection("responses").insertOne(responseData)
    
    return NextResponse.json(
      { id: result.insertedId, ...responseData },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating response:", error)
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    )
  }
}
