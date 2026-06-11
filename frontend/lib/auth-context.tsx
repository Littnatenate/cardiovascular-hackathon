"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginUser as apiLoginUser } from "@/lib/api"

interface AuthUser {
  id: string
  employeeId: string
  name: string
  role: string
  token?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (employeeId: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check session storage on mount
    const storedUser = sessionStorage.getItem("medsafe_auth")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        sessionStorage.removeItem("medsafe_auth")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup'

    // Route guards
    if (!user && !isPublicRoute) {
      router.push('/login')
    } else if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard')
    }
  }, [user, isLoading, pathname, router])

  const login = async (employeeId: string, password: string) => {
    try {
      const response = await apiLoginUser(employeeId, password)
      const newUser = {
        id: response.user.id,
        employeeId: response.user.employee_id,
        name: response.user.name,
        role: response.user.role,
        token: response.token 
      }
      setUser(newUser)
      sessionStorage.setItem("medsafe_auth", JSON.stringify(newUser))
      router.push('/dashboard')
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in")
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("medsafe_auth")
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {/* Wait until auth check is done to prevent flicker */}
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
