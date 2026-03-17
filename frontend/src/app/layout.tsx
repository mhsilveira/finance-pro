import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { AppShell } from "@/components/AppShell";

const spaceGrotesk = Space_Grotesk({
	weight: ["400", "500", "600", "700"],
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
			<body className={spaceGrotesk.className}>
				<QueryProvider>
					<ThemeProvider>
						<AppShell>{children}</AppShell>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
