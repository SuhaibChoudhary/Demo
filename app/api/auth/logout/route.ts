import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, getClientIP, getUserAgent } from "@/lib/auth"
import { Logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    // Get user info before clearing token
    const user = await verifyAuth(request)

    if (user) {
      await Logger.logLogout(user.discordId, ip, userAgent)
    }

    const response = NextResponse.json({ success: true })

    // Clear the auth token cookie
    response.cookies.set(config.cookies.authToken, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Logout error"
    await Logger.logError("logout_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
