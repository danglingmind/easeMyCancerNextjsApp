"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type SchemaField } from "@/lib/connectors/connector"
import DynamicForm from "@/components/DynamicForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import PDFGenerator from "@/components/PDFGenerator"

export default function NutritionFormPage() {
	const [schema, setSchema] = useState<{ fields: SchemaField[] } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null)
	const router = useRouter()

	useEffect(() => {
		loadSchema()
	}, [])

	const loadSchema = async () => {
    try {
        const res = await fetch("/api/schema")
        if (!res.ok) throw new Error("Failed to load schema")
        const data = await res.json()
        if (data?.fields) setSchema({ fields: data.fields as SchemaField[] })
    } catch (error) {
			console.error("Error loading schema:", error)
    } finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = async (formData: Record<string, unknown>) => {
		setIsSubmitting(true)
		
    try {
        const res = await fetch("/api/forms/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error("Failed to submit form")
        await res.json()
        setSubmittedData(formData)
        setIsSubmitted(true)
    } catch (error) {
			console.error("Error submitting form:", error)
			alert("Failed to submit form. Please try again.")
    } finally {
			setIsSubmitting(false)
		}
	}


	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-96">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading form...</p>
				</div>
			</div>
		)
	}

	if (!schema || schema.fields.length === 0) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardContent className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">No Form Available</h3>
					<p className="text-gray-600 mb-4">
						No nutrition form schema has been configured yet. Please contact your administrator.
					</p>
					<Button onClick={() => router.push("/dashboard/user")}>
						Back to Dashboard
					</Button>
				</CardContent>
			</Card>
		)
	}

	if (isSubmitted) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="flex items-center text-green-600">
						<CheckCircle className="mr-2 h-6 w-6" />
						Form Submitted Successfully
					</CardTitle>
					<CardDescription>
						Your nutrition form has been submitted and saved to the system.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-green-50 p-4 rounded-lg">
						<h4 className="font-medium text-green-800 mb-2">Submitted Information:</h4>
						<div className="space-y-1 text-sm text-green-700">
							{Object.entries(submittedData || {}).map(([key, value]) => (
								<div key={key} className="flex justify-between">
									<span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
									<span>{String(value)}</span>
								</div>
							))}
						</div>
					</div>
					
					<div className="space-y-4">
						<PDFGenerator 
							data={submittedData || {}} 
							title="Nutrition Assessment Report"
							subtitle="Personalized Nutrition Plan"
						/>
						<Button onClick={() => router.push("/dashboard/user")} className="w-full">
							Back to Dashboard
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900">Nutrition Assessment Form</h1>
				<p className="mt-2 text-gray-600">
					Please fill out this form to help us understand your nutritional needs.
				</p>
			</div>
			
			<DynamicForm
				fields={schema.fields}
				onSubmit={handleSubmit}
				title="Nutrition Assessment"
				description="Please provide accurate information to help us create the best nutrition plan for you."
				isSubmitting={isSubmitting}
			/>
		</div>
	)
}
