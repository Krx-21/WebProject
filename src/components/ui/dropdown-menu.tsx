import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  let trigger: React.ReactElement | null = null
  let content: React.ReactElement | null = null

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return

    if (child.type === DropdownMenuTrigger) {
      trigger = React.cloneElement(child as React.ReactElement<DropdownMenuTriggerProps>, {
        onClick: () => setIsOpen(prev => !prev)
      })
    } else if (child.type === DropdownMenuContent) {
      content = React.cloneElement(child as React.ReactElement<DropdownMenuContentProps>, { isOpen })
    }
  })

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {trigger}
      {content}
    </div>
  )
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  align?: 'start' | 'end' | 'center'
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className = "",
  isOpen = false,
  align = 'end'
}) => {
  if (!isOpen) return null

  let alignmentClass = "right-0"
  if (align === 'start') alignmentClass = "left-0"
  if (align === 'center') alignmentClass = "left-1/2 -translate-x-1/2"

  return (
    <div
      className={`absolute ${alignmentClass} mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 ${className}`}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  inset?: boolean
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className = "",
  inset = false,
  ...props
}) => {
  return (
    <button
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 ${inset ? 'pl-8' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  inset?: boolean
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className = "",
  inset = false,
  ...props
}) => {
  return (
    <div
      className={`px-2 py-1.5 text-sm font-semibold ${inset ? 'pl-8' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800 ${className}`}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
}
