"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type SchemaField } from "@/lib/connectors/connector"

interface DynamicFormProps {
	fields: SchemaField[]
	onSubmit: (data: Record<string, unknown>) => Promise<void>
	title?: string
	description?: string
	isSubmitting?: boolean
}

export default function DynamicForm({ 
	fields, 
	onSubmit, 
	title = "Form", 
	description = "Please fill out the form below",
	isSubmitting = false 
}: DynamicFormProps) {
	const [formData, setFormData] = useState<Record<string, unknown>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleInputChange = (fieldKey: string, value: unknown) => {
		setFormData(prev => ({
			...prev,
			[fieldKey]: value
		}))
		
		// Clear error when user starts typing
		if (errors[fieldKey]) {
			setErrors(prev => ({
				...prev,
				[fieldKey]: ""
			}))
		}
	}

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}
		
		fields.forEach(field => {
			if (field.required && (!formData[field.key] || formData[field.key] === "")) {
				newErrors[field.key] = `${field.label} is required`
			}
			
			// Type validation
			if (formData[field.key] && field.type === "number") {
				const numValue = Number(formData[field.key])
				if (isNaN(numValue)) {
					newErrors[field.key] = `${field.label} must be a valid number`
				}
			}
			
			if (formData[field.key] && field.type === "date") {
				const dateValue = new Date(formData[field.key] as string)
				if (isNaN(dateValue.getTime())) {
					newErrors[field.key] = `${field.label} must be a valid date`
				}
			}
		})
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!validateForm()) {
			return
		}
		
		try {
			await onSubmit(formData)
		} catch (error) {
			console.error("Form submission error:", error)
		}
	}

	const renderField = (field: SchemaField) => {
		const fieldValue = formData[field.key]
		const hasError = !!errors[field.key]

		switch (field.type) {
			case "string":
				return (
					<div key={field.key} className="space-y-2">
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.key}
							type="text"
							value={fieldValue as string || ""}
							onChange={(e) => handleInputChange(field.key, e.target.value)}
							className={hasError ? "border-red-500" : ""}
							placeholder={`Enter ${field.label.toLowerCase()}`}
						/>
						{hasError && (
							<p className="text-sm text-red-500">{errors[field.key]}</p>
						)}
					</div>
				)

			case "number":
				return (
					<div key={field.key} className="space-y-2">
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.key}
							type="number"
							value={fieldValue as number || ""}
							onChange={(e) => handleInputChange(field.key, e.target.value)}
							className={hasError ? "border-red-500" : ""}
							placeholder={`Enter ${field.label.toLowerCase()}`}
						/>
						{hasError && (
							<p className="text-sm text-red-500">{errors[field.key]}</p>
						)}
					</div>
				)

			case "date":
				return (
					<div key={field.key} className="space-y-2">
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.key}
							type="date"
							value={fieldValue as string || ""}
							onChange={(e) => handleInputChange(field.key, e.target.value)}
							className={hasError ? "border-red-500" : ""}
						/>
						{hasError && (
							<p className="text-sm text-red-500">{errors[field.key]}</p>
						)}
					</div>
				)

			case "boolean":
				return (
					<div key={field.key} className="flex items-center space-x-2">
						<Checkbox
							id={field.key}
							checked={fieldValue as boolean || false}
							onCheckedChange={(checked) => handleInputChange(field.key, checked)}
						/>
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						{hasError && (
							<p className="text-sm text-red-500 ml-2">{errors[field.key]}</p>
						)}
					</div>
				)

			case "enum":
				return (
					<div key={field.key} className="space-y-2">
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Select
							value={fieldValue as string || ""}
							onValueChange={(value) => handleInputChange(field.key, value)}
						>
							<SelectTrigger className={hasError ? "border-red-500" : ""}>
								<SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
							</SelectTrigger>
							<SelectContent>
								{field.enumOptions?.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{hasError && (
							<p className="text-sm text-red-500">{errors[field.key]}</p>
						)}
					</div>
				)

			default:
				return (
					<div key={field.key} className="space-y-2">
						<Label htmlFor={field.key}>
							{field.label}
							{field.required && <span className="text-red-500 ml-1">*</span>}
						</Label>
						<Input
							id={field.key}
							type="text"
							value={fieldValue as string || ""}
							onChange={(e) => handleInputChange(field.key, e.target.value)}
							className={hasError ? "border-red-500" : ""}
							placeholder={`Enter ${field.label.toLowerCase()}`}
						/>
						{hasError && (
							<p className="text-sm text-red-500">{errors[field.key]}</p>
						)}
					</div>
				)
		}
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{fields.map(renderField)}
					
					<div className="flex justify-end space-x-4">
						<Button
							type="submit"
							disabled={isSubmitting}
							className="min-w-32"
						>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}


