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

    const discordApi = new DiscordAPI(currentUser.accessToken || "") // Assuming accessToken is stored or can be retrieved
    const userDiscordGuilds = await discordApi.getUserGuilds()

    const guildsWithBotStatus: (Guild & { canManage: boolean })[] = []

    for (const discordGuild of userDiscordGuilds) {
      // Check if the user has manage guild or admin permissions
      const canManage =
        discordGuild.owner ||
        hasDiscordPermission(discordGuild.permissions, DiscordPermissions.ADMINISTRATOR) ||
        hasDiscordPermission(discordGuild.permissions, DiscordPermissions.MANAGE_GUILD)

      // Fetch guild from DB to get botAdded status and config
      const dbGuild = await db.collection<Guild>("guilds").findOne({ guildId: discordGuild.id })

      if (dbGuild && dbGuild.botAdded) {
        // Only include guilds where the bot is added
        guildsWithBotStatus.push({
          ...dbGuild,
          name: discordGuild.name, // Use Discord's current name
          icon: discordGuild.icon, // Use Discord's current icon
          canManage: canManage,
        })
      }
    }

    await Logger.log({
      level: "info",
      event: "user_guilds_fetched",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: guildsWithBotStatus.length },
    })

    return NextResponse.json({ guilds: guildsWithBotStatus })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get guilds error"
    await Logger.logError("get_guilds_internal_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
