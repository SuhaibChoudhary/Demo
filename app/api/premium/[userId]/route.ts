import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { User } from "@/lib/models/User"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user || user.discordId !== params.userId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_premium_access_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
        metadata: { targetUserId: params.userId },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userData = await db.collection<User>("users").findOne({ discordId: params.userId })

    if (!userData) {
      await Logger.logError("user_not_found_for_premium", "User not found in DB for premium data", user.discordId, {
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate active premium guilds
    const premiumGuildsCount = await db.collection("guilds").countDocuments({
      guildId: { $in: userData.guilds || [] },
      "premium.active": true,
      "premium.expiresAt": { $gt: new Date() },
    })

    const premiumData = {
      count: userData.premium.count,
      expiresAt: userData.premium.expiresAt,
      activeGuilds: premiumGuildsCount,
    }

    await Logger.log({
      level: "info",
      event: "premium_data_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { premiumData },
    })

    return NextResponse.json({ premium: premiumData })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get premium error"
    await Logger.logError("get_premium_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
