import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 hover:bg-yellow-400",
				destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
				outline: "border border-slate-700 bg-slate-900 text-gray-100 hover:bg-slate-800 hover:border-slate-600",
				secondary: "bg-slate-800 text-gray-100 hover:bg-slate-700",
				ghost: "text-gray-400 hover:bg-slate-800 hover:text-gray-100",
				link: "text-yellow-400 underline-offset-4 hover:underline hover:text-yellow-300",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-lg px-3",
				lg: "h-11 rounded-lg px-8",
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
