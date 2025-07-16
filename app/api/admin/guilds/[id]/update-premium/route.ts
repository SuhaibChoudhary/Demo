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
        event: "unauthorized_admin_guild_premium_update_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { active, expiryDays } = await request.json()

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid 'active' status. Must be a boolean." }, { status: 400 })
    }
    if (expiryDays !== undefined && (typeof expiryDays !== "number" || expiryDays < 0)) {
      return NextResponse.json(
        { error: "Invalid expiryDays. Must be a non-negative number or undefined." },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const targetGuild = await db.collection<Guild>("guilds").findOne({ guildId: params.id })

    if (!targetGuild) {
      await Logger.log({
        level: "warn",
        event: "admin_guild_premium_update_guild_not_found",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, active, expiryDays },
      })
      return NextResponse.json({ error: "Guild not found." }, { status: 404 })
    }

    let newExpiresAt: Date | undefined = undefined
    if (active) {
      if (expiryDays !== undefined) {
        if (expiryDays === 0) {
          newExpiresAt = undefined // No expiry
        } else {
          newExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        }
      } else if (targetGuild.premium?.expiresAt) {
        newExpiresAt = targetGuild.premium.expiresAt // Keep existing expiry if not provided
      } else {
        newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days if activating and no expiry provided
      }
    } else {
      newExpiresAt = undefined // If deactivating, clear expiry
    }

    const updateResult = await db.collection<Guild>("guilds").updateOne(
      { guildId: params.id },
      {
        $set: {
          "premium.active": active,
          "premium.expiresAt": newExpiresAt,
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      await Logger.logError(
        "admin_guild_premium_update_failed",
        "Failed to update guild premium status",
        user.discordId,
        {
          ip,
          userAgent,
          guildId: params.id,
          active,
          expiryDays,
        },
      )
      return NextResponse.json({ error: "Failed to update guild premium." }, { status: 500 })
    }

    await Logger.log({
      level: "info",
      event: "admin_guild_premium_updated",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id, active, newExpiresAt },
    })

    return NextResponse.json({
      success: true,
      message: `Guild ${targetGuild.name}'s premium updated successfully.`,
      newPremiumActive: active,
      newPremiumExpiry: newExpiresAt?.toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Update guild premium error"
    await Logger.logError("admin_guild_premium_update_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      requestBody: request.body,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
