"use client"

import { useAuth } from "@/lib/auth-context"
import { Shield, User, Award, Activity, Calendar } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4" />
            {user.role} &middot; {user.employeeId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            Credentials
          </h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><strong>Department:</strong> Pharmacy & Clinical Therapeutics</li>
            <li><strong>Specialization:</strong> Cardiology Discharge Planning</li>
            <li><strong>Access Level:</strong> Level 4 (PHI Authorized)</li>
          </ul>
        </div>
        
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <div className="mt-1"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
              <div>
                <p className="font-medium">System Login</p>
                <p className="text-muted-foreground text-xs">Today, 08:30 AM (IP: 192.168.1.14)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
              <div>
                <p className="font-medium">Password Rotation</p>
                <p className="text-muted-foreground text-xs">45 days ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
