import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Activity, FileText, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl w-full space-y-12 text-center">
          
          {/* Hero Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              <Shield className="w-4 h-4" />
              Singapore Health Services Cluster
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Clinical Medication <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Reconciliation, Perfected.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              MedSafe automates discharge medication workflows using AI, generating 
              patient education materials, and ensuring seamless handoffs with zero omission.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  Launch Portal
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-border/50 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-foreground mb-2">99.4%</span>
              <span className="text-sm font-medium text-muted-foreground text-center">Reconciliation Accuracy</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-foreground mb-2">12m</span>
              <span className="text-sm font-medium text-muted-foreground text-center">Average Time Saved / Patient</span>
            </div>
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-foreground mb-2">0%</span>
              <span className="text-sm font-medium text-muted-foreground text-center">Medication Omission Rate</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 text-left">
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Reconciliation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                OCR-backed drug validation automatically detects discrepancies between ward orders and discharge prescriptions.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Education</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated Healthier SG advice formatted with clear medication dosage structures directly to patients.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Clinical PDF</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One-click professional medical logs perfectly formatted for hospital handouts and audit trails.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
