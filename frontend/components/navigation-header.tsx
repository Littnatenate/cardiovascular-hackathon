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
import { LogOut, User, Settings, ChevronDown, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function NavigationHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and App Name */}
        <Link href={isPublicPage ? '/' : '/dashboard'} className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:bg-primary/90 transition-all duration-300 group-hover:shadow-md">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              MedSafe
            </span>
            <span className="hidden text-xs font-medium text-muted-foreground sm:block">
              Discharge Hub
            </span>
          </div>
        </Link>

        {/* User Menu or Public Actions */}
        {isPublicPage || !user ? (
          <div className="flex items-center gap-4">
            {pathname !== '/login' && (
              <Button onClick={() => router.push('/login')} className="hidden sm:flex rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-all gap-2 group">
                Enter Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-secondary rounded-full transition-all"
              >
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start sm:flex">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/50">
              <div className="flex items-center gap-3 px-3 py-2 sm:hidden">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator className="sm:hidden opacity-50" />
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer rounded-lg mx-1 my-0.5">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer rounded-lg mx-1 my-0.5">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-50" />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive cursor-pointer rounded-lg mx-1 my-0.5 font-semibold"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}

