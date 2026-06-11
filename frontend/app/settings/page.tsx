"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Bell, ShieldCheck } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <h1 className="text-3xl font-bold mb-8">Portal Settings</h1>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <Monitor className="w-5 h-5 text-primary" />
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button 
              onClick={() => setTheme("system")}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'}`}
            >
              <Monitor className="w-6 h-6" />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Receive daily summaries of escalated discharge sessions.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </label>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-border bg-card opacity-70">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Security & Compliance
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Security settings are managed centrally by the IT Security Administration team.
          </p>
          <button disabled className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed">
            Manage 2FA (Locked)
          </button>
        </section>
      </div>
    </div>
  )
}
