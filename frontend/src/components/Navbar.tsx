"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HamburgerMenuIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const { theme, toggleTheme, mounted } = useTheme();

	const navItems = [
		{ href: "/dashboard", label: "Dashboard", icon: "📊" },
		{ href: "/transactions", label: "Transações", icon: "💳" },
		{ href: "/recurring", label: "Recorrentes", icon: "🔄" },
		{ href: "/analytics", label: "Análises", icon: "📈" },
		{ href: "/budget", label: "Orçamento", icon: "🎯" },
	];

	const isActive = (href: string) => pathname === href;

	return (
		<nav className="sticky top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200 dark:border-gray-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-2 group">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
							<span className="text-white text-xl">💰</span>
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							Finance Pro
						</span>
					</Link>

					{/* Desktop Navigation + Theme Toggle */}
					<div className="flex items-center gap-2">
						<ul className="hidden md:flex items-center gap-1">
							{navItems.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
											isActive(item.href)
												? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
												: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
										}`}
									>
										<span>{item.icon}</span>
										<span>{item.label}</span>
									</Link>
								</li>
							))}
						</ul>

						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							aria-label="Toggle theme"
						>
							{mounted && theme === "dark" ? (
								<SunIcon className="w-5 h-5 text-yellow-500" />
							) : (
								<MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
							)}
						</button>

						{/* Mobile Menu Button */}
						<button
							className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							onClick={() => setOpen(!open)}
							aria-label="toggle menu"
						>
							<HamburgerMenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{open && (
					<div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
						<ul className="space-y-1">
							{navItems.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={() => setOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
											isActive(item.href)
												? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
												: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
										}`}
									>
										<span className="text-xl">{item.icon}</span>
										<span>{item.label}</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</nav>
	);
}
