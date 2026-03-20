"use client"

import { ArrowLeft, Settings, Moon, Sun, Monitor } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-8 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
      
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Notifications</h2>
          <div className="bg-card rounded-xl border border-border p-5 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-semibold text-sm">Notifications</h3>
              <p className="text-xs text-muted-foreground mt-1">Receive email alerts for escalated sessions</p>
            </div>
            <button 
              type="button" 
              role="switch" 
              aria-checked={notificationsEnabled} 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)} 
              className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${notificationsEnabled ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Appearance</h2>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4">Theme Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant={theme === "light" ? "default" : "outline"} 
                className="flex flex-col gap-2 h-auto py-4 flex-1"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-4 h-4 mr-2" />
                <span className="text-xs">Light</span>
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"} 
                className="flex flex-col gap-2 h-auto py-4 flex-1"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-4 h-4 mr-2" />
                <span className="text-xs">Dark</span>
              </Button>
              <Button 
                variant={theme === "system" ? "default" : "outline"} 
                className="flex flex-col gap-2 h-auto py-4 flex-1"
                onClick={() => setTheme("system")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                <span className="text-xs">System</span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
