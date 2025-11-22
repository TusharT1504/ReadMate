"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import Link from "next/link"
import { BookOpen, Compass, User, Clock, LogOut, Search, Heart } from "lucide-react"
import api from "@/lib/api"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear cookies on server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth state regardless of API call success
      clearAuth();
      router.push('/');
    }
  }

  const navLinks = [
    { href: "/discover", label: "Discover", icon: <Compass className="w-4 h-4" aria-hidden /> },
    { href: "/search", label: "Search", icon: <Search className="w-4 h-4" aria-hidden /> },
    { href: "/favorites", label: "Favorites", icon: <Heart className="w-4 h-4" aria-hidden /> },
    { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" aria-hidden /> },
    { href: "/history", label: "History", icon: <Clock className="w-4 h-4" aria-hidden /> },
  ]

  return (
    <nav className="sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="glass px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href={isAuthenticated ? "/discover" : "/"} className="flex items-center gap-2">
            <div
              aria-label="ReadMate"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
            >
              <BookOpen className="w-5 h-5" aria-hidden />
            </div>
            <span className="text-xl font-semibold">ReadMate</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition hover-lift ${
                      active ? "text-primary" : "text-muted hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.icon}
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                )
              })}

              {/* User / Logout */}
              <div className="flex items-center gap-4 pl-4 ml-2">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-sm text-primary hover-lift"
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
