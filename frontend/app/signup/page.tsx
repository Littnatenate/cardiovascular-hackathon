"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">Request Access</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-sm">
        New clinical personnel must request MedSafe access directly through the hospital IT support portal to ensure proper security clearance.
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="default" className="w-full" onClick={() => {}}>
          Open IT Portal
        </Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
          Back to Log In
        </Button>
      </div>
    </div>
  )
}
