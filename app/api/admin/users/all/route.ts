import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { User } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_users_access_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()
    // Fetch all users, excluding sensitive fields like _id and email if not needed
    const users = await db
      .collection<User>("users")
      .find(
        {},
        { projection: { _id: 0, discordId: 1, username: 1, avatar: 1, premium: 1, createdAt: 1, lastLogin: 1 } },
      )
      .sort({ createdAt: -1 })
      .toArray()

    await Logger.log({
      level: "info",
      event: "admin_users_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: users.length },
    })

    return NextResponse.json({ users })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get all users error"
    console.error("API/Admin/Users/All: Error in GET handler:", errorMessage, error) // Added console.error
    await Logger.logError("get_all_users_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
