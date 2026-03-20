import { ReactNode } from "react"
import { SessionSidebar } from "./session-sidebar"

interface SessionLayoutProps {
  children: ReactNode
}

export function SessionLayout({ children }: SessionLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background relative">
      <div className="hidden md:block sticky top-0 h-screen">
        <SessionSidebar />
      </div>
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  )
}
