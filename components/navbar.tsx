"use client"

import Link from "next/link"

interface NavbarProps {
  user: { id: string; email: string } | null
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">MT</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">MindTrack</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Calendar
            </Link>
            <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          <button
            onClick={onLogout}
            className="text-sm px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
