import type React from "react"
import { redirect } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { config } from "@/lib/config"
import { headers } from "next/headers" // Use headers for server-side access

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
  } as any // Cast to any to match NextRequest structure for verifyAuth

  const user = await verifyAuth(request)

  if (!user || user.discordId !== config.adminDiscordId) {
    // Redirect to dashboard or a forbidden page if not admin
    redirect("/dashboard")
  }

  return <>{children}</>
}
