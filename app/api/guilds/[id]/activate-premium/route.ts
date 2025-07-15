import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { User } from "@/lib/models/User"
import type { Guild } from "@/lib/models/Guild"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_activate_premium_attempt",
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const currentUser = await db.collection<User>("users").findOne({ discordId: user.discordId })
    const targetGuild = await db.collection<Guild>("guilds").findOne({ guildId: params.id })

    if (!currentUser) {
      await Logger.logError(
        "activate_premium_user_not_found",
        "User not found for premium activation",
        user.discordId,
        {
          ip,
          userAgent,
          guildId: params.id,
        },
      )
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!targetGuild) {
      await Logger.logError(
        "activate_premium_guild_not_found",
        "Guild not found for premium activation",
        user.discordId,
        {
          ip,
          userAgent,
          guildId: params.id,
        },
      )
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Check if user has available premium slots
    if ((currentUser.premium?.count || 0) <= 0) {
      await Logger.log({
        level: "warn",
        event: "activate_premium_no_slots",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "No premium slots available" },
      })
      return NextResponse.json({ error: "You have no available premium slots." }, { status: 400 })
    }

    // Check if guild is already premium and not expired
    if (targetGuild.premium?.active && targetGuild.premium.expiresAt && targetGuild.premium.expiresAt > new Date()) {
      await Logger.log({
        level: "warn",
        event: "activate_premium_guild_already_active",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Guild already premium" },
      })
      return NextResponse.json({ error: "This guild is already premium." }, { status: 400 })
    }

    // Determine premium expiry for the guild (use user's expiry or default to 30 days from now)
    const guildPremiumExpiresAt = currentUser.premium.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Decrement user's premium count and update guild's premium status
    const session = db.client.startSession()
    session.startTransaction()

    try {
      await db.collection<User>("users").updateOne(
        { _id: currentUser._id },
        {
          $inc: { "premium.count": -1 }, // Decrement count
          $set: { lastSeen: new Date() },
        },
        { session },
      )

      await db.collection<Guild>("guilds").updateOne(
        { _id: targetGuild._id },
        {
          $set: {
            "premium.active": true,
            "premium.expiresAt": guildPremiumExpiresAt,
            updatedAt: new Date(),
          },
        },
        { session },
      )

      await session.commitTransaction()

      await Logger.log({
        level: "info",
        event: "guild_premium_activated",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: {
          guildId: params.id,
          newPremiumCount: currentUser.premium.count - 1,
          expiresAt: guildPremiumExpiresAt,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Premium activated for ${targetGuild.name}! You have ${currentUser.premium.count - 1} slots remaining.`,
        newPremiumCount: currentUser.premium.count - 1,
        guildPremiumExpiresAt: guildPremiumExpiresAt.toISOString(),
      })
    } catch (transactionError) {
      await session.abortTransaction()
      throw transactionError
    } finally {
      session.endSession()
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Activate premium error"
    await Logger.logError("activate_premium_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      guildId: params.id,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
