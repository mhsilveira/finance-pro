"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Receipt,
	Repeat,
	BarChart3,
	Target,
	ChevronLeft,
	ChevronRight,
	X,
	Menu,
	Wallet,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/transactions", label: "Transações", icon: Receipt },
	{ href: "/recurring", label: "Recorrentes", icon: Repeat },
	{ href: "/analytics", label: "Análises", icon: BarChart3 },
	{ href: "/budget", label: "Orçamento", icon: Target },
];

export function Sidebar() {
	const pathname = usePathname();
	const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

	const isActive = (href: string) => pathname === href;

	const sidebarContent = (
		<>
			<div className={`flex items-center h-16 px-4 border-b border-[var(--border-glass)] ${collapsed ? "justify-center" : "gap-3"}`}>
				<div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
					<Wallet className="w-5 h-5 text-white" />
				</div>
				{!collapsed && (
					<span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
						Finance Pro
					</span>
				)}
			</div>

			<nav className="flex-1 px-3 py-4 space-y-1">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setMobileOpen(false)}
							className={`
								group relative flex items-center gap-3 rounded-lg transition-all duration-150
								${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
								${active
									? "bg-purple-500/10 text-purple-300"
									: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
								}
							`}
						>
							{active && (
								<div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-glow)] rounded-r-full" />
							)}
							<Icon className={`w-[20px] h-[20px] shrink-0 ${active ? "text-purple-400" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"}`} />
							{!collapsed && (
								<span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
							)}
							{collapsed && (
								<div className="absolute left-full ml-2 px-2.5 py-1 bg-[var(--bg-glass-elevated)] text-[var(--text-primary)] text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-[var(--border-glass)]">
									{item.label}
								</div>
							)}
						</Link>
					);
				})}
			</nav>

			<div className="hidden md:flex border-t border-[var(--border-glass)] p-3">
				<button
					onClick={() => setCollapsed(!collapsed)}
					className="flex items-center justify-center w-full py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-all"
				>
					{collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
				</button>
			</div>
		</>
	);

	return (
		<>
			<div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-glass-elevated)]/95 backdrop-blur-md border-b border-[var(--border-glass)] flex items-center px-4 z-40">
				<button
					onClick={() => setMobileOpen(true)}
					className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
					aria-label="Abrir menu"
				>
					<Menu className="w-5 h-5 text-[var(--text-secondary)]" />
				</button>
				<div className="flex items-center gap-2.5 ml-3">
					<div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-purple-600 rounded-md flex items-center justify-center">
						<Wallet className="w-4 h-4 text-white" />
					</div>
					<span className="text-base font-semibold text-[var(--text-primary)]">Finance Pro</span>
				</div>
			</div>

			{mobileOpen && (
				<div className="md:hidden fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setMobileOpen(false)}
					/>
					<aside className="absolute left-0 top-0 bottom-0 w-64 bg-[var(--bg-glass-elevated)] border-r border-[var(--border-glass)] flex flex-col animate-slide-in">
						<button
							onClick={() => setMobileOpen(false)}
							className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
							aria-label="Fechar menu"
						>
							<X className="w-4 h-4 text-[var(--text-muted)]" />
						</button>
						{sidebarContent}
					</aside>
				</div>
			)}

			<aside
				className={`
					hidden md:flex flex-col fixed top-0 left-0 bottom-0 bg-[var(--bg-glass-elevated)] backdrop-blur-xl border-r border-[var(--border-glass)] z-30
					transition-[width] duration-200 ease-in-out
					${collapsed ? "w-16" : "w-60"}
				`}
			>
				{sidebarContent}
			</aside>
		</>
	);
}
