import * as React from "react"

import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-gray-100 ring-offset-slate-950 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
