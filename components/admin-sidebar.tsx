"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Gift, Users, BarChart3 } from "lucide-react"

const adminNavigation = [
  { name: "Overview", href: "/dashboard/admin", icon: BarChart3 },
  { name: "Redeem Codes", href: "/dashboard/admin/redeem-codes", icon: Gift },
  { name: "User Management", href: "/dashboard/admin/users", icon: Users },
  // Add more admin links here as needed
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-56 flex-shrink-0 neumorphic border-r border-white/10 p-4 hidden lg:block">
      <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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
      </nav>
    </div>
  )
}
