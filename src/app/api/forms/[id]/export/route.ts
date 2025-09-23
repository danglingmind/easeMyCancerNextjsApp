import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import * as XLSX from "xlsx"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    
    const db = await getDatabase()
    const { id } = await params
    
    // Get form details
    const form = await db.collection("forms").findOne({
      _id: new ObjectId(id)
    })
    
    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      )
    }
    
    // Get all responses for this form
    const responses = await db.collection("responses").find({
      formId: id
    }).toArray()
    
    if (responses.length === 0) {
      return NextResponse.json(
        { error: "No responses found for this form" },
        { status: 404 }
      )
    }
    
    // Prepare data for Excel export
    const exportData = responses.map((response) => {
      const row: Record<string, unknown> = {
        "Response ID": response._id,
        "User ID": response.userId,
        "Submitted At": new Date(response.submittedAt).toLocaleString(),
      }
      
      // Flatten the response data
      if (response.response) {
        Object.keys(response.response).forEach(key => {
          const value = response.response[key]
          row[key] = Array.isArray(value) ? value.join(", ") : value
        })
      }
      
      return row
    })
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Response ID
      { wch: 15 }, // User ID
      { wch: 20 }, // Submitted At
    ]
    worksheet["!cols"] = columnWidths
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses")
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "buffer", 
      bookType: "xlsx" 
    })
    
    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${form.title}_responses.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting responses:", error)
    return NextResponse.json(
      { error: "Failed to export responses" },
      { status: 500 }
    )
  }
}
