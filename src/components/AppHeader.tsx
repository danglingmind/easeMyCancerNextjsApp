"use client"

import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Settings, Users, BarChart3, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AppHeader() {
	const { user } = useUser()
	const { signOut } = useClerk()
	const pathname = usePathname()
	const router = useRouter()

	const isAdmin = user?.publicMetadata?.role === "admin" || user?.publicMetadata?.role === "nutritionist"

	const navigation = isAdmin
		? [
				{ name: "Dashboard", href: "/dashboard", icon: Home },
				{ name: "Forms", href: "/dashboard/admin/forms", icon: FileText },
				{ name: "Schema", href: "/dashboard/admin/schema", icon: Settings },
				{ name: "Responses", href: "/dashboard/admin/responses", icon: BarChart3 },
			]
		: [
				{ name: "My Forms", href: "/dashboard/user", icon: Home },
				{ name: "Nutrition Form", href: "/dashboard/user/nutrition-form", icon: FileText },
			]

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between px-4">
				{/* Logo and Brand */}
				<div className="flex items-center space-x-4">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<FileText className="h-4 w-4" />
						</div>
						<span className="hidden font-bold sm:inline-block">Ease My Cancer</span>
					</Link>
					
					<Separator orientation="vertical" className="h-6" />
					
					{/* Navigation */}
					<nav className="hidden items-center space-x-1 md:flex">
						{navigation.map((item) => {
							const Icon = item.icon
							const isActive = pathname === item.href
							
							return (
								<Button
									key={item.name}
									variant={isActive ? "default" : "ghost"}
									size="sm"
									asChild
									className={cn(
										"h-8 px-3",
										isActive && "bg-primary text-primary-foreground"
									)}
								>
									<Link href={item.href} className="flex items-center space-x-2">
										<Icon className="h-4 w-4" />
										<span>{item.name}</span>
									</Link>
								</Button>
							)
						})}
					</nav>
				</div>

				{/* User Menu */}
				<div className="flex items-center space-x-4">
					{/* Role Badge */}
					<Badge variant={isAdmin ? "default" : "secondary"} className="hidden sm:inline-flex">
						{isAdmin ? "Admin" : "User"}
					</Badge>

					{/* User Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
									<AvatarFallback>
										{user?.fullName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{user?.fullName || "User"}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user?.emailAddresses?.[0]?.emailAddress}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/dashboard" className="flex items-center">
									<Home className="mr-2 h-4 w-4" />
									Dashboard
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/dashboard/user" className="flex items-center">
									<FileText className="mr-2 h-4 w-4" />
									My Forms
								</Link>
							</DropdownMenuItem>
							{isAdmin && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/dashboard/admin/forms" className="flex items-center">
											<FileText className="mr-2 h-4 w-4" />
											Manage Forms
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/dashboard/admin/schema" className="flex items-center">
											<Settings className="mr-2 h-4 w-4" />
											Schema Management
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/dashboard/admin/responses" className="flex items-center">
											<BarChart3 className="mr-2 h-4 w-4" />
											View Responses
										</Link>
									</DropdownMenuItem>
								</>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/dashboard/user/nutrition-form" className="flex items-center">
									<FileText className="mr-2 h-4 w-4" />
									Nutrition Form
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/dashboard/user" className="flex items-center">
									<Users className="mr-2 h-4 w-4" />
									Profile
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem 
								onClick={() => signOut(() => router.push("/"))}
								className="flex items-center cursor-pointer"
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}