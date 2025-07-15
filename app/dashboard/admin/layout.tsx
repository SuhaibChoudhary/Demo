import type React from "react"
import { redirect } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { config } from "@/lib/config"
import { headers } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar" // Import AdminSidebar

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const request = {
    headers: headersList,
    cookies: {
      get: (name: string) => {
        const cookieHeader = headersList.get("cookie")
        const cookie = cookieHeader?.split("; ").find((row) => row.startsWith(`${name}=`))
        return cookie ? { name, value: cookie.split("=")[1] } : undefined
      },
    },
  } as any

  const user = await verifyAuth(request)

  if (!user || user.discordId !== config.adminDiscordId) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.8))] lg:min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  )
}
