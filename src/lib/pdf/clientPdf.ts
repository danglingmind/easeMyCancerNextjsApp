"use client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePdfFromElement(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let positionY = 0
  let remainingHeight = imgHeight

  while (remainingHeight > 0) {
    pdf.addImage(imgData, "PNG", 0, positionY, imgWidth, imgHeight)
    remainingHeight -= pageHeight
    if (remainingHeight > 0) {
      pdf.addPage()
      positionY = 0
    }
  }

  pdf.save(filename)
}


