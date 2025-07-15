import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { DiscordAPI, DiscordPermissions, hasDiscordPermission } from "@/lib/discord"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { Guild } from "@/lib/models/Guild"

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
    const guild = await db.collection<Guild>("guilds").findOne({ guildId: params.id })

    if (!guild) {
      await Logger.logError("guild_not_found", "Guild not found in DB", user.discordId, {
        ip,
        userAgent,
        guildId: params.id,
      })
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    const discordAccessToken = request.cookies.get("discord-access-token")?.value
    if (!discordAccessToken) {
      await Logger.log({
        level: "warn",
        event: "discord_access_token_missing",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Cannot verify Discord permissions without token" },
      })
      return NextResponse.json({ error: "Missing Discord access token for permission check" }, { status: 403 })
    }

    const discordApi = new DiscordAPI(discordAccessToken)
    let userGuildsFromDiscord: any[] = []
    try {
      userGuildsFromDiscord = await discordApi.getUserGuilds()
    } catch (discordError) {
      const errorMessage = discordError instanceof Error ? discordError.message : "Unknown Discord API error"
      await Logger.logError("discord_api_guilds_fetch_failed", errorMessage, user.discordId, {
        ip,
        userAgent,
        guildId: params.id,
      })
      return NextResponse.json({ error: "Failed to verify Discord permissions" }, { status: 500 })
    }

    const userGuildData = userGuildsFromDiscord.find((g) => g.id === params.id)

    let canManage = false
    if (userGuildData) {
      canManage =
        userGuildData.owner ||
        hasDiscordPermission(userGuildData.permissions, DiscordPermissions.ADMINISTRATOR) ||
        hasDiscordPermission(userGuildData.permissions, DiscordPermissions.MANAGE_GUILD)
    }

    if (!userGuildData) {
      await Logger.log({
        level: "warn",
        event: "guild_access_denied",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "User not found in Discord's guild list" },
      })
      return NextResponse.json({ error: "Access denied: You are not a member of this guild" }, { status: 403 })
    }

    await Logger.log({
      level: "info",
      event: "guild_data_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id, canManage },
    })

    return NextResponse.json({ guild, canManage })
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
    const { config: newConfig } = body

    const db = await getDatabase()

    const discordAccessToken = request.cookies.get("discord-access-token")?.value
    if (!discordAccessToken) {
      await Logger.log({
        level: "warn",
        event: "discord_access_token_missing_for_update",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { guildId: params.id, reason: "Cannot verify Discord permissions without token" },
      })
      return NextResponse.json({ error: "Missing Discord access token for permission check" }, { status: 403 })
    }

    const discordApi = new DiscordAPI(discordAccessToken)
    let userGuildsFromDiscord: any[] = []
    try {
      userGuildsFromDiscord = await discordApi.getUserGuilds()
    } catch (discordError) {
      const errorMessage = discordError instanceof Error ? discordError.message : "Unknown Discord API error"
      await Logger.logError("discord_api_guilds_fetch_failed_for_update", errorMessage, user.discordId, {
        ip,
        userAgent,
        guildId: params.id,
      })
      return NextResponse.json({ error: "Failed to verify Discord permissions" }, { status: 500 })
    }

    const userGuildData = userGuildsFromDiscord.find((g) => g.id === params.id)

    let canManage = false
    if (userGuildData) {
      canManage =
        userGuildData.owner ||
        hasDiscordPermission(userGuildData.permissions, DiscordPermissions.ADMINISTRATOR) ||
        hasDiscordPermission(userGuildData.permissions, DiscordPermissions.MANAGE_GUILD)
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

    const result = await db.collection("guilds").findOneAndUpdate(
      { guildId: params.id },
      {
        $set: {
          config: {
            prefix: newConfig.prefix || "!",
            language: newConfig.language || "en",
            automod: newConfig.automod || false,
            logging: newConfig.logging || false,
            logChannel: newConfig.logChannel,
            welcomeMessages: newConfig.welcomeMessages || false,
            welcomeChannel: newConfig.welcomeChannel, // New
            welcomeMessage: newConfig.welcomeMessage, // New
            musicEnabled: newConfig.musicEnabled || false,
            moderationLogs: newConfig.moderationLogs || false,
            moderationChannel: newConfig.moderationChannel,
            customCommands: newConfig.customCommands || [],
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

    await db.collection("audit_logs").insertOne({
      guildId: params.id,
      userId: user.discordId,
      action: "config_update",
      changes: newConfig,
      timestamp: new Date(),
    })

    await Logger.log({
      level: "info",
      event: "guild_config_updated",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildId: params.id, updatedConfig: newConfig },
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
