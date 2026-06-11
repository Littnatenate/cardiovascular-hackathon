"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Lock, ArrowRight, Zap, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickFill = () => {
    setEmployeeId("PHARM-8942")
    setPassword("password123")
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      await login(employeeId, password)
    } catch (err: any) {
      setError(err.message || "Failed to authenticate")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute top-0 left-[-100%] w-[200%] h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[shimmer_3s_infinite]" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">MedSafe Portal</h1>
            <p className="text-muted-foreground text-sm max-w-xs">
              Singapore Health Services Cluster
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Employee ID
              </label>
              <input 
                required
                className="w-full h-12 px-4 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none" 
                placeholder="e.g. PHARM-8942" 
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <span className="text-xs text-primary hover:underline cursor-pointer">Forgot?</span>
              </div>
              <input 
                required
                type="password" 
                className="w-full h-12 px-4 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="pt-2 flex flex-col gap-3">
              <Button type="submit" disabled={isLoading} className="w-full h-12 text-sm font-bold shadow-md rounded-xl group transition-all hover:-translate-y-0.5">
                {isLoading ? "Authenticating..." : "Authenticate"}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleQuickFill}
                disabled={isLoading}
                className="w-full h-12 text-sm font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
              >
                <Zap className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                Demo Quick-Fill
              </Button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Require access? <strong className="text-primary cursor-pointer hover:underline transition-colors" onClick={() => router.push('/signup')}>Submit Request</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
