import * as React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600
          bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          px-3 py-2 text-sm
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-slate-500 dark:placeholder:text-slate-400
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };