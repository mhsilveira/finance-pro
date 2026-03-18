"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function AppContent({ children }: { children: React.ReactNode }) {
	const { collapsed } = useSidebar();

	return (
		<div className="min-h-screen">
			<Sidebar />
			<main
				className={`
					pt-14 md:pt-0 min-h-screen transition-[padding-left] duration-200 ease-in-out
					${collapsed ? "md:pl-16" : "md:pl-60"}
				`}
			>
				{children}
			</main>
		</div>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLanding = pathname === "/";

	if (isLanding) {
		return <>{children}</>;
	}

	return (
		<SidebarProvider>
			<AppContent>{children}</AppContent>
		</SidebarProvider>
	);
}
