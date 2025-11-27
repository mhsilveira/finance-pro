// src/app/layout.tsx
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const poppins = Poppins({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata = {
	title: "Finance Pro",
	description: "Controle financeiro pessoal inteligente",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={poppins.className}>
				<ThemeProvider>
					<Navbar />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
