import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"

  let variantClasses = ""
  switch (variant) {
    case "secondary":
      variantClasses = "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      break
    case "destructive":
      variantClasses = "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      break
    case "outline":
      variantClasses = "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"
      break
    default:
      variantClasses = "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} {...props} />
  )
}

export { Badge }
