import * as React from "react"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<{ activeTab?: string; onTabChange?: (value: string) => void }>, {
        activeTab,
        onTabChange: handleTabChange
      })
    }
    return child
  })

  return <div className="tabs">{childrenWithProps}</div>
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (value: string) => void
}

const TabsList: React.FC<TabsListProps> = ({ className = "", children, activeTab, onTabChange }) => {
  const childrenWithProps = React.Children.map(children, child => {
     if (React.isValidElement<TabsTriggerProps>(child)) {
      return React.cloneElement(child, {
        activeTab,
        onTabChange
      })
    }
    return child
  })

  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}>
      {childrenWithProps}
    </div>
  )
}

interface TabsTriggerProps {
  className?: string
  value: string
  activeTab?: string
  onTabChange?: (value: string) => void
  children: React.ReactNode
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  className = "",
  value,
  activeTab,
  onTabChange,
  children
}) => {
  const isActive = activeTab === value

  const handleClick = () => {
    if (onTabChange) {
      onTabChange(value)
    }
  }

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}
        ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  className?: string
  value: string
  activeTab?: string
  children: React.ReactNode
}

const TabsContent: React.FC<TabsContentProps> = ({
  className = "",
  value,
  activeTab,
  children
}) => {
  if (activeTab !== value) {
    return null
  }

  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
