import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { Guild } from "@/lib/models/Guild"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_remove_premium_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()
    const result = await db.collection<Guild>("guilds").updateOne(
      { guildId: params.id },
      {
        $set: {
          "premium.active": false,
          "premium.expiresAt": null, // Clear expiry date
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      await Logger.log({
        level: "warn",
        event: "admin_remove_premium_guild_not_found",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    await Logger.log({
      level: "info",
      event: "admin_guild_premium_removed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id },
    })

    return NextResponse.json({ success: true, message: `Premium removed from guild ${params.id}.` })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Remove premium error"
    await Logger.logError("remove_premium_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      guildId: params.id,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
