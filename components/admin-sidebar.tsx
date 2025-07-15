"use client"

import { Bot, Crown, Gift, Home, Settings, Users } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Guilds",
    href: "/dashboard/admin/guilds", // New link
    icon: Bot,
  },
  {
    title: "Redeem Codes",
    href: "/dashboard/admin/redeem-codes",
    icon: Gift,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Crown className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-bold text-white">Admin Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
