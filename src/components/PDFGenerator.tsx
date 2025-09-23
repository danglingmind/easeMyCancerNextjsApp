"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface PDFGeneratorProps {
	data: Record<string, unknown>
	title?: string
	subtitle?: string
}

export default function PDFGenerator({ data, title = "Nutrition Assessment Report", subtitle = "Personalized Nutrition Plan" }: PDFGeneratorProps) {
	const [isGenerating, setIsGenerating] = useState(false)

	const generatePDF = async () => {
		setIsGenerating(true)
		
		try {
			// Create a temporary div to render the PDF content
			const pdfContent = document.createElement("div")
			pdfContent.style.position = "absolute"
			pdfContent.style.left = "-9999px"
			pdfContent.style.top = "0"
			pdfContent.style.width = "800px"
			pdfContent.style.padding = "40px"
			pdfContent.style.backgroundColor = "white"
			pdfContent.style.fontFamily = "Arial, sans-serif"
			pdfContent.style.fontSize = "14px"
			pdfContent.style.lineHeight = "1.6"
			pdfContent.style.color = "#333"
			
			// Generate HTML content for the PDF
			pdfContent.innerHTML = generatePDFHTML(data, title, subtitle)
			
			// Add to document temporarily
			document.body.appendChild(pdfContent)
			
			// Convert to canvas
			const canvas = await html2canvas(pdfContent, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff"
			})
			
			// Remove temporary element
			document.body.removeChild(pdfContent)
			
			// Create PDF
			const imgData = canvas.toDataURL("image/png")
			const pdf = new jsPDF("p", "mm", "a4")
			
			// Calculate dimensions
			const imgWidth = 210 // A4 width in mm
			const pageHeight = 295 // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width
			let heightLeft = imgHeight
			
			let position = 0
			
			// Add image to PDF
			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
			heightLeft -= pageHeight
			
			// Add new pages if content is longer than one page
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight
				pdf.addPage()
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
				heightLeft -= pageHeight
			}
			
			// Download the PDF
			const fileName = `nutrition-assessment-${new Date().toISOString().split('T')[0]}.pdf`
			pdf.save(fileName)
			
		} catch (error) {
			console.error("Error generating PDF:", error)
			alert("Failed to generate PDF. Please try again.")
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<Button 
			onClick={generatePDF} 
			disabled={isGenerating}
			variant="outline"
			className="w-full"
		>
			{isGenerating ? (
				<>
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
					Generating PDF...
				</>
			) : (
				<>
					<Download className="mr-2 h-4 w-4" />
					Download PDF Report
				</>
			)}
		</Button>
	)
}

function generatePDFHTML(data: Record<string, unknown>, title: string, subtitle: string): string {
	const currentDate = new Date().toLocaleDateString()
	
	return `
		<div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
			<!-- Header -->
			<div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
				<h1 style="color: #1f2937; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">
					${title}
				</h1>
				<h2 style="color: #6b7280; font-size: 18px; font-weight: normal; margin: 0 0 10px 0;">
					${subtitle}
				</h2>
				<p style="color: #9ca3af; font-size: 14px; margin: 0;">
					Generated on ${currentDate}
				</p>
			</div>
			
			<!-- Patient Information Section -->
			<div style="margin-bottom: 30px;">
				<h3 style="color: #1f2937; font-size: 20px; font-weight: bold; margin: 0 0 20px 0; border-left: 4px solid #3b82f6; padding-left: 15px;">
					Patient Information
				</h3>
				<div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
					${Object.entries(data)
						.filter(([key, value]) => value !== null && value !== undefined && value !== "")
						.map(([key, value]) => `
							<div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
								<span style="font-weight: 600; color: #374151; text-transform: capitalize;">
									${key.replace(/_/g, " ")}:
								</span>
								<span style="color: #1f2937;">
									${formatValue(value)}
								</span>
							</div>
						`).join("")}
				</div>
			</div>
			
			<!-- Recommendations Section -->
			<div style="margin-bottom: 30px;">
				<h3 style="color: #1f2937; font-size: 20px; font-weight: bold; margin: 0 0 20px 0; border-left: 4px solid #10b981; padding-left: 15px;">
					Nutritional Recommendations
				</h3>
				<div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
					<p style="color: #065f46; margin: 0 0 15px 0; font-weight: 600;">
						Based on your assessment, here are our recommendations:
					</p>
					<ul style="color: #047857; margin: 0; padding-left: 20px;">
						<li style="margin-bottom: 8px;">Maintain a balanced diet with adequate protein intake</li>
						<li style="margin-bottom: 8px;">Stay hydrated with at least 8 glasses of water daily</li>
						<li style="margin-bottom: 8px;">Include a variety of fruits and vegetables in your meals</li>
						<li style="margin-bottom: 8px;">Consider consulting with a nutritionist for personalized guidance</li>
					</ul>
				</div>
			</div>
			
			<!-- Footer -->
			<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
				<p style="margin: 0;">
					This report was generated by Ease My Cancer Forms Application
				</p>
				<p style="margin: 5px 0 0 0;">
					For questions or concerns, please contact your healthcare provider
				</p>
			</div>
		</div>
	`
}

function formatValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "Not provided"
	}
	
	if (typeof value === "boolean") {
		return value ? "Yes" : "No"
	}
	
	if (typeof value === "string" && value.trim() === "") {
		return "Not provided"
	}
	
	return String(value)
}


