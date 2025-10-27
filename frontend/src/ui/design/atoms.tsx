"use client";
import React from "react";

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow)",
                padding: 16,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function Stack({
    children,
    gap = 12,
    direction = "column",
    align,
    justify,
    style,
}: {
    children: React.ReactNode;
    gap?: number;
    direction?: "row" | "column";
    align?: React.CSSProperties["alignItems"];
    justify?: React.CSSProperties["justifyContent"];
    style?: React.CSSProperties;
}) {
    return (
        <div
            style={{
                display: "flex",
                gap,
                flexDirection: direction,
                alignItems: align,
                justifyContent: justify,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function Text({
    children,
    size = 14,
    weight = 400,
    muted = false,
    style,
}: {
    children: React.ReactNode;
    size?: number;
    weight?: number;
    muted?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <div style={{ fontSize: size, fontWeight: weight, color: muted ? "var(--muted)" : "inherit", ...style }}>
            {children}
        </div>
    );
}

export const H1 = ({ children }: { children: React.ReactNode }) => (
    <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 0.2 }}>{children}</h1>
);

export function Button({
    children,
    variant = "primary",
    onClick,
    type = "button",
    disabled,
}: {
    children: React.ReactNode;
    variant?: "primary" | "ghost" | "danger";
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
}) {
    const bg = variant === "primary" ? "var(--primary)" : variant === "danger" ? "var(--danger)" : "transparent";
    const color = variant === "ghost" ? "var(--text)" : "#0b0e14";
    const border = variant === "ghost" ? "1px solid var(--border)" : "1px solid transparent";
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: bg,
                color,
                border,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
            }}
        >
            {children}
        </button>
    );
}

export function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label style={{ display: "grid", gap: 6 }}>
            {label && (
                <span className="muted" style={{ fontSize: 12 }}>
                    {label}
                </span>
            )}
            <input
                {...props}
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    padding: "10px 12px",
                    outline: "none",
                }}
            />
        </label>
    );
}

export function Select({
    label,
    children,
    ...props
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <label style={{ display: "grid", gap: 6 }}>
            {label && (
                <span className="muted" style={{ fontSize: 12 }}>
                    {label}
                </span>
            )}
            <select
                {...props}
                style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    padding: "10px 12px",
                    outline: "none",
                    backgroundImage:
                        "linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%)",
                    backgroundPosition: "calc(100% - 18px) calc(1em + 2px), calc(100% - 12px) calc(1em + 2px)",
                    backgroundSize: "6px 6px, 6px 6px",
                    backgroundRepeat: "no-repeat",
                }}
            >
                {children}
            </select>
        </label>
    );
}
