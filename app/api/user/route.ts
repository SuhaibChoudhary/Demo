import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, getClientIP, getUserAgent } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_user_access",
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userData = await db.collection("users").findOne({ discordId: user.discordId })

    if (!userData) {
      await Logger.logError("user_not_found", "User data missing from database", user.discordId, { ip, userAgent })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user stats
    const guilds = await db
      .collection("guilds")
      .find({
        guildId: { $in: userData.guilds || [] },
      })
      .toArray()

    const stats = {
      totalGuilds: guilds.length,
      totalMembers: guilds.reduce((sum, guild) => sum + (guild.memberCount || 0), 0),
      premiumGuilds: guilds.filter((g) => g.premiumStatus).length,
    }

    // Log successful user data access
    await Logger.log({
      level: "info",
      event: "user_data_accessed",
      userId: user.discordId,
      ip,
      userAgent,
    })

    return NextResponse.json({
      user: {
        discordId: userData.discordId,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        premiumStatus: userData.premiumStatus,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
        lastSeen: userData.lastSeen,
      },
      stats,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get user error"
    await Logger.logError("get_user_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
