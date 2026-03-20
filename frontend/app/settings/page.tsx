"use client"

import { ArrowLeft, Settings, Moon, Sun, Monitor } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <Link href="/dashboard" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-8 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
      </div>
      
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5 flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">Receive email alerts for escalated sessions</p>
          </div>
          <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Theme Appearance</h3>
            <p className="text-xs text-muted-foreground mt-1">Select your preferred interface theme</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex-1"
            >
              <Sun className="w-4 h-4 mr-2" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex-1"
            >
              <Monitor className="w-4 h-4 mr-2" />
              System
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
