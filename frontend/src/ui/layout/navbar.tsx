"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stack, Text } from "@/ui/design/atoms";

const links = [
    { href: "/", label: "Dashboard" },
    { href: "/transactions", label: "Transações" },
    { href: "/reports", label: "Relatórios" },
    { href: "/analytics", label: "Análises" },
];

export default function Navbar() {
    const pathname = usePathname();
    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid var(--border)",
                background: "rgba(15,17,21,0.6)",
            }}
        >
            <div className="container" style={{ paddingTop: 12, paddingBottom: 12 }}>
                <Stack direction="row" gap={16} align="center" justify="space-between">
                    <Text size={18} weight={700}>
                        Finance Pro
                    </Text>
                    <Stack direction="row" gap={12}>
                        {links.map((l) => {
                            const active = pathname === l.href;
                            return (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    style={{
                                        padding: "8px 10px",
                                        borderRadius: 8,
                                        border: active ? "1px solid var(--border)" : "1px solid transparent",
                                        background: active ? "rgba(255,255,255,0.04)" : "transparent",
                                        color: active ? "var(--text)" : "var(--muted)",
                                    }}
                                >
                                    {l.label}
                                </Link>
                            );
                        })}
                    </Stack>
                </Stack>
            </div>
        </div>
    );
}
