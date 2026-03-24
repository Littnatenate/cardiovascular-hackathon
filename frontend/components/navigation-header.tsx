'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type { Nurse } from '@/lib/types'

interface NavigationHeaderProps {
  nurse: Nurse
  onLogout?: () => void
}

export function NavigationHeader({ nurse, onLogout }: NavigationHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Track the last "main" page for smart navigation
  useEffect(() => {
    const systemPages = ['/profile', '/settings', '/login', '/signup']
    if (!systemPages.includes(pathname)) {
      sessionStorage.setItem('lastMainPage', pathname)
    }
  }, [pathname])
  const initials = nurse.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and App Name */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary group-hover:bg-primary/90 transition-colors">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              MedSafe Discharge
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Discharge Session Management
            </span>
          </div>
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-secondary"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium text-foreground">
                  {nurse.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {nurse.role}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 px-2 py-1.5 sm:hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{nurse.name}</span>
                <span className="text-xs text-muted-foreground">
                  {nurse.role}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (onLogout) onLogout()
                router.push('/login')
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
