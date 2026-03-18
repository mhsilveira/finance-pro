"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark";

interface ThemeContextType {
	theme: Theme;
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
	theme: "dark",
	mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		document.documentElement.classList.add("dark");
		setMounted(true);
	}, []);

	return <ThemeContext.Provider value={{ theme: "dark", mounted }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
