"use client"

import { ArrowLeft, User } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  const handleBack = () => {
    const lastMain = sessionStorage.getItem('lastMainPage') || '/dashboard'
    router.push(lastMain)
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <button onClick={handleBack} className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-8 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sarah Chen</h1>
          <p className="text-muted-foreground">Senior Pharmacist</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <section className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 border-b pb-3">
              <span className="text-sm text-muted-foreground font-medium">Employee ID</span>
              <span className="text-sm font-medium col-span-2">PHARM-8942</span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-b pb-3">
              <span className="text-sm text-muted-foreground font-medium">Email</span>
              <span className="text-sm font-medium col-span-2">sarah.chen@hospital.sg</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="text-sm text-muted-foreground font-medium">Assigned Wards</span>
              <span className="text-sm font-medium col-span-2">General Medicine, Cardiology</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
