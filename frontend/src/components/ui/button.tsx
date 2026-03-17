import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--accent-glow)] hover:bg-[var(--accent-primary-hover)] hover:shadow-[0_0_30px_var(--accent-glow)]",
				destructive: "bg-pink-500/15 text-pink-400 border border-pink-500/30 hover:bg-pink-500/25 hover:border-pink-500/50",
				outline: "border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass-hover)]",
				secondary: "border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-glass-hover)] hover:border-[var(--border-glass-hover)]",
				ghost: "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
				link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-xl px-3",
				lg: "h-11 rounded-xl px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
