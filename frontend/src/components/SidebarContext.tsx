"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextValue {
	collapsed: boolean;
	setCollapsed: (value: boolean) => void;
	mobileOpen: boolean;
	setMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "sidebar-collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [collapsed, setCollapsedState] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored !== null) setCollapsedState(stored === "true");
	}, []);

	const setCollapsed = (value: boolean) => {
		setCollapsedState(value);
		localStorage.setItem(STORAGE_KEY, String(value));
	};

	return (
		<SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
	return ctx;
}
