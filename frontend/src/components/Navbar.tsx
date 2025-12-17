"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

export function Navbar() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	const navItems = [
		{ href: "/dashboard", label: "Dashboard", icon: "📊" },
		{ href: "/transactions", label: "Transações", icon: "💳" },
		{ href: "/recurring", label: "Recorrentes", icon: "🔄" },
		{ href: "/analytics", label: "Análises", icon: "📈" },
		{ href: "/budget", label: "Orçamento", icon: "🎯" },
	];

	const isActive = (href: string) => pathname === href;

	return (
		<nav className="sticky top-0 left-0 w-full bg-slate-900/95 backdrop-blur-md z-50 border-b border-slate-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3 group">
						<div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-all">
							<span className="text-slate-950 text-xl font-bold">💰</span>
						</div>
						<span className="text-xl font-bold text-gray-100 tracking-tight">Finance Pro</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="flex items-center gap-2">
						<ul className="hidden md:flex items-center gap-1">
							{navItems.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
											isActive(item.href)
												? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
												: "text-gray-400 hover:text-gray-100 hover:bg-slate-800"
										}`}
									>
										<span>{item.icon}</span>
										<span>{item.label}</span>
									</Link>
								</li>
							))}
						</ul>

						{/* Mobile Menu Button */}
						<button
							className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-all"
							onClick={() => setOpen(!open)}
							aria-label="toggle menu"
						>
							<HamburgerMenuIcon className="w-6 h-6 text-gray-400" />
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{open && (
					<div className="md:hidden py-4 border-t border-slate-800">
						<ul className="space-y-1">
							{navItems.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										onClick={() => setOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
											isActive(item.href)
												? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
												: "text-gray-400 hover:text-gray-100 hover:bg-slate-800"
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
