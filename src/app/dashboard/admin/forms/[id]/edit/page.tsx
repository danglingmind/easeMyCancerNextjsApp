"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditFormPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		schema: "",
	})

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/forms/${params.id}`)
				if (!res.ok) throw new Error("Failed to load form")
				const data = await res.json()
				setFormData({
					title: data.title ?? "",
					description: data.description ?? "",
					schema: JSON.stringify(data.schema ?? {}, null, 2),
				})
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to load form")
			} finally {
				setLoading(false)
			}
		}
		void load()
	}, [params.id])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		try {
			let parsed
			try {
				parsed = JSON.parse(formData.schema)
			} catch {
				throw new Error("Schema must be valid JSON")
			}
			const res = await fetch(`/api/forms/${params.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: formData.title,
					description: formData.description,
					schema: parsed,
				}),
			})
			if (!res.ok) throw new Error("Failed to update form")
			router.push("/dashboard/admin/forms")
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to update form")
		}
	}

	if (loading) return <div>Loading...</div>

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Edit Form</h1>
				<p className="mt-2 text-gray-600">Update form details and schema</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="text-sm text-red-700">{error}</div>
					</div>
				)}

				<div>
					<label htmlFor="title" className="block text-sm font-medium text-gray-700">
						Form Title
					</label>
					<input
						type="text"
						id="title"
						required
						value={formData.title}
						onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder="Enter form title"
					/>
				</div>

				<div>
					<label htmlFor="description" className="block text-sm font-medium text-gray-700">
						Description
					</label>
					<textarea
						id="description"
						required
						rows={3}
						value={formData.description}
						onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder="Enter form description"
					/>
				</div>

				<div>
					<label htmlFor="schema" className="block text-sm font-medium text-gray-700">
						Form Schema (JSON)
					</label>
					<textarea
						id="schema"
						required
						rows={15}
						value={formData.schema}
						onChange={(e) => setFormData(prev => ({ ...prev, schema: e.target.value }))}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
						placeholder="Paste your SurveyJS JSON schema here"
					/>
					<p className="mt-1 text-sm text-gray-500">
						Enter the SurveyJS JSON schema for your form
					</p>
				</div>

				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => router.back()}
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	)
}


