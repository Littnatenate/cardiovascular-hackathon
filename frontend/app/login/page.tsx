"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">MedSafe Discharge</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-sm">Sign in to manage patient discharge sessions securely.</p>
      
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Employee ID</label>
          <input className="w-full h-10 px-3 rounded-md border text-sm bg-background border-border focus:outline-primary" placeholder="e.g. PHARM-8942" defaultValue="PHARM-8942" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input type="password" className="w-full h-10 px-3 rounded-md border text-sm bg-background border-border focus:outline-primary" placeholder="••••••••" defaultValue="password123" />
        </div>
        <Button className="w-full h-11 mt-6 text-sm font-semibold shadow-sm" onClick={() => router.push('/dashboard')}>Sign In</Button>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground">
        Don't have an account? <strong className="text-primary cursor-pointer hover:underline" onClick={() => router.push('/signup')}>Request Access</strong>
      </p>
    </div>
  )
}
