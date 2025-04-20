"use client"

import * as React from "react"

const Select = ({ children, value, onChange, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors duration-200 ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  )
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectItem = ({ value, children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) => {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  )
}

const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectValue = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectLabel = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const SelectSeparator = () => {
  return <hr className="my-1 border-t border-slate-200 dark:border-slate-700" />
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
