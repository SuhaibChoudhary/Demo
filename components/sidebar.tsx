"use client"

import { useState, useEffect } from "react" // Import useEffect
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Server, Crown, User, Bell, Settings, Menu, X, Bot, LogOut, ShieldCheck } from "lucide-react" // Import ShieldCheck
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config" // Import config

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Guilds", href: "/dashboard/guilds", icon: Server },
  { name: "Premium", href: "/dashboard/premium", icon: Crown },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // New state for admin status
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.user.discordId === config.adminDiscordId)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Failed to check admin status:", error)
      setIsAdmin(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 neumorphic p-2"
        variant="ghost"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        neumorphic border-r border-white/10
      `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 neumorphic rounded-xl flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-primary-400" />
              </div>
              <span className="text-xl font-bold text-white">Noisy</span>
            </div>
            <Button onClick={() => setIsOpen(false)} className="lg:hidden p-1" variant="ghost">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary-600/20 text-primary-300 neumorphic-inset"
                        : "text-foreground hover:text-white hover:bg-primary-500/10"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    pathname.startsWith("/dashboard/admin")
                      ? "bg-primary-600/20 text-primary-300 neumorphic-inset"
                      : "text-foreground hover:text-white hover:bg-primary-500/10"
                  }
                `}
              >
                <ShieldCheck className="w-5 h-5 mr-3" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 pt-4">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-red-400"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin mr-3" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
