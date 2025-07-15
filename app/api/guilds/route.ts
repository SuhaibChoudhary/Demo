import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { DiscordAPI, hasDiscordPermission, DiscordPermissions } from "@/lib/discord"
import type { Guild } from "@/lib/models/Guild"
import type { User } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_guilds_access_attempt",
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const currentUser = await db.collection<User>("users").findOne({ discordId: user.discordId })

    if (!currentUser) {
      await Logger.logError("get_guilds_user_not_found", "User not found in DB", user.discordId, {
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const discordAccessToken = request.cookies.get("discord-access-token")?.value
    if (!discordAccessToken) {
      await Logger.log({
        level: "warn",
        event: "discord_access_token_missing",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { reason: "Cannot fetch Discord guilds without token" },
      })
      return NextResponse.json({ error: "Missing Discord access token for guild fetching" }, { status: 403 })
    }
    const discordApi = new DiscordAPI(discordAccessToken)
    const userDiscordGuilds = await discordApi.getUserGuilds()

    const guildsToDisplay: (Guild & { canManage: boolean })[] = []

    for (const discordGuild of userDiscordGuilds) {
      // Check if the user has manage guild or admin permissions
      const canManage =
        discordGuild.owner ||
        hasDiscordPermission(discordGuild.permissions, DiscordPermissions.ADMINISTRATOR) ||
        hasDiscordPermission(discordGuild.permissions, DiscordPermissions.MANAGE_GUILD)

      // Only include guilds the user can manage
      if (!canManage) {
        continue // Skip guilds the user cannot manage
      }

      // Fetch guild from DB to get botAdded status and config
      const dbGuild = await db.collection<Guild>("guilds").findOne({ guildId: discordGuild.id })

      guildsToDisplay.push({
        // Use data from DB if available, otherwise default values
        _id: dbGuild?._id, // MongoDB ObjectId
        guildId: discordGuild.id,
        name: discordGuild.name, // Always use Discord's current name
        icon: discordGuild.icon, // Always use Discord's current icon
        ownerId: dbGuild?.ownerId || discordGuild.owner ? user.discordId : "unknown", // Use DB ownerId or Discord owner if current user is owner
        botAdded: dbGuild?.botAdded || false, // Default to false if not in DB
        premium: dbGuild?.premium || { active: false }, // Default to non-premium
        config: dbGuild?.config || {
          // Default config if not in DB
          prefix: "!",
          language: "en",
          automod: false,
          logging: false,
          welcomeMessages: false,
          musicEnabled: false,
          moderationLogs: false,
        },
        createdAt: dbGuild?.createdAt || new Date(), // Use DB createdAt or current date
        updatedAt: dbGuild?.updatedAt || new Date(), // Use DB updatedAt or current date
        canManage: canManage,
      })
    }

    await Logger.log({
      level: "info",
      event: "user_guilds_fetched",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: guildsToDisplay.length },
    })

    return NextResponse.json({ guilds: guildsToDisplay })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get guilds error"
    await Logger.logError("get_guilds_internal_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
