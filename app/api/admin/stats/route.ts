import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_stats_access_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()

    // Fetch statistics
    const totalUsers = await db.collection("users").countDocuments()
    const totalGuilds = await db.collection("guilds").countDocuments()
    const totalPremiumUsers = await db.collection("users").countDocuments({
      "premium.count": { $gt: 0 },
      "premium.expiresAt": { $gt: new Date() },
    })
    const totalRedeemCodes = await db.collection("redeem_codes").countDocuments()
    const usedRedeemCodes = await db.collection("redeem_codes").countDocuments({ usedBy: { $exists: true } })

    await Logger.log({
      level: "info",
      event: "admin_stats_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { totalUsers, totalGuilds, totalPremiumUsers, totalRedeemCodes, usedRedeemCodes },
    })

    return NextResponse.json({
      totalUsers,
      totalGuilds,
      totalPremiumUsers,
      totalRedeemCodes,
      usedRedeemCodes,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get admin stats error"
    console.error("API/Admin/Stats: Error in GET handler:", errorMessage, error) // Added console.error
    await Logger.logError("get_admin_stats_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
