"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft, ExternalLink } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
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
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-border/50">
              <ShieldAlert className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-4">Request Access</h1>
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50 text-sm text-muted-foreground leading-relaxed">
              New clinical personnel must request MedSafe access directly through the hospital IT support portal to ensure proper security clearance.
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button variant="default" className="w-full h-12 text-sm font-bold shadow-md rounded-xl group transition-all" onClick={() => {}}>
              Open IT Support Portal
              <ExternalLink className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="ghost" className="w-full h-12 text-sm font-semibold hover:bg-secondary rounded-xl transition-all" onClick={() => router.push('/login')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
