import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle } from "lucide-react"

export default function UserDashboardPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
				<p className="mt-2 text-gray-600">
					Access your forms and track your submissions
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<FileText className="mr-2 h-5 w-5" />
							Nutrition Assessment
						</CardTitle>
						<CardDescription>
							Complete your nutrition assessment form
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/dashboard/user/nutrition-form">
							<Button className="w-full">
								Start Form
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Clock className="mr-2 h-5 w-5" />
							Pending Forms
						</CardTitle>
						<CardDescription>
							Forms that need your attention
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">No pending forms</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<CheckCircle className="mr-2 h-5 w-5" />
							Completed Forms
						</CardTitle>
						<CardDescription>
							Your submitted forms and responses
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-gray-500">No completed forms yet</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Your recent form submissions and updates
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<FileText className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
						<p className="mt-1 text-sm text-gray-500">
							Complete a form to see your activity here.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}


