// src/app/layout.tsx
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";

const poppins = Poppins({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata = {
	title: "Finance Pro",
	description: "Controle financeiro pessoal inteligente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={poppins.className}>
				<QueryProvider>
					<ThemeProvider>
						<Navbar />
						{children}
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
