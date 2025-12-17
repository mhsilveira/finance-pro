import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				"flex h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all md:text-sm",
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = "Input";

export { Input };
