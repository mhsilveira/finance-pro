import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";
import Navbar from "@/ui/layout/navbar";

export const metadata: Metadata = {
    title: "Finance Pro",
    description: "Personal finance Playground with React/Redux",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>
                    <Navbar />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
