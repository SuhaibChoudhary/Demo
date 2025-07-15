import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { DiscordAPI, DiscordPermissions } from "@/lib/discord" // Import DiscordPermissions
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_guild_access_attempt",
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const guild = await db.collection("guilds").findOne({ guildId: params.id })

    if (!guild) {
      await Logger.logError("guild_not_found", "Guild not found in DB", user.discordId, {
        ip,
        userAgent,
        guildId: params.id,
      })
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Check if user has access to this guild and permissions
    const discordApi = new DiscordAPI(request.cookies.get("discord-access-token")?.value || "") // Requires access token
    let userGuildsFromDiscord = []
    try {
      userGuildsFromDiscord = await discordApi.getUserGuilds()
    } catch (discordError) {
      console.warn("Could not fetch user guilds from Discord API:", discordError)
      // Continue without Discord permissions if API fails, rely on DB user.guilds
    }

    const userHasAccess = userGuildsFromDiscord.some((g) => g.id === params.id) || user.guilds.includes(params.id)
    const userGuildData = userGuildsFromDiscord.find((g) => g.id === params.id)

    let canManage = false
    if (userGuildData) {
      canManage =
        userGuildData.owner ||
        DiscordPermissions.hasDiscordPermission(userGuildData.permissions, DiscordPermissions.ADMINISTRATOR) ||
        DiscordPermissions.hasDiscordPermission(userGuildData.permissions, DiscordPermissions.MANAGE_GUILD)
    }

    if (!userHasAccess) {
      await Logger.log({
        level: "warn",
        event: "guild_access_denied",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Not in user's guilds" },
      })
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await Logger.log({
      level: "info",
      event: "guild_data_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id },
    })

    return NextResponse.json({ guild, canManage }) // Return canManage status
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get guild error"
    await Logger.logError("get_guild_error", errorMessage, undefined, { ip, userAgent, guildId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_guild_config_update_attempt",
        ip,
        userAgent,
        metadata: { guildId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { config } = body

    const db = await getDatabase()

    // Check if user has access to this guild and permissions
    const discordApi = new DiscordAPI(request.cookies.get("discord-access-token")?.value || "") // Requires access token
    let userGuildsFromDiscord = []
    try {
      userGuildsFromDiscord = await discordApi.getUserGuilds()
    } catch (discordError) {
      console.warn("Could not fetch user guilds from Discord API for permission check:", discordError)
      // If Discord API fails, we cannot reliably check permissions, so deny by default
      await Logger.log({
        level: "warn",
        event: "guild_config_update_denied",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Discord API unavailable for permission check" },
      })
      return NextResponse.json({ error: "Permission check failed: Discord API unavailable" }, { status: 403 })
    }

    const userGuildData = userGuildsFromDiscord.find((g) => g.id === params.id)

    let canManage = false
    if (userGuildData) {
      canManage =
        userGuildData.owner ||
        DiscordPermissions.hasDiscordPermission(userGuildData.permissions, DiscordPermissions.ADMINISTRATOR) ||
        DiscordPermissions.hasDiscordPermission(userGuildData.permissions, DiscordPermissions.MANAGE_GUILD)
    }

    if (!canManage) {
      await Logger.log({
        level: "warn",
        event: "guild_config_update_denied",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Insufficient Discord permissions" },
      })
      return NextResponse.json({ error: "Insufficient Discord permissions" }, { status: 403 })
    }

    // Update guild configuration
    const result = await db.collection("guilds").findOneAndUpdate(
      { guildId: params.id },
      {
        $set: {
          config: {
            prefix: config.prefix || "!",
            language: config.language || "en",
            automod: config.automod || false,
            logging: config.logging || false,
            logChannel: config.logChannel,
            welcomeMessages: config.welcomeMessages || false,
            welcomeChannel: config.welcomeChannel,
            musicEnabled: config.musicEnabled || false,
            moderationLogs: config.moderationLogs || false,
            moderationChannel: config.moderationChannel,
            customCommands: config.customCommands || [],
          },
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      await Logger.logError("guild_config_update_failed", "Guild not found for update", user.discordId, {
        ip,
        userAgent,
        guildId: params.id,
      })
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Log the configuration change
    await db.collection("audit_logs").insertOne({
      guildId: params.id,
      userId: user.discordId,
      action: "config_update",
      changes: config,
      timestamp: new Date(),
    })

    await Logger.log({
      level: "info",
      event: "guild_config_updated",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id, updatedConfig: config },
    })

    return NextResponse.json({
      success: true,
      guild: result.value,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Update guild error"
    await Logger.logError("update_guild_error", errorMessage, undefined, { ip, userAgent, guildId: params.id })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
