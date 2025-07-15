import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, DiscordAPI, getDiscordAvatarUrl, getDiscordGuildIconUrl } from "@/lib/discord"
import { getDatabase, testConnection } from "@/lib/mongodb"
import { generateAuthToken, getClientIP, getUserAgent } from "@/lib/auth"
import { Logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    // Test database connection
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("Database connection failed during auth callback")
      return NextResponse.redirect(`${config.baseUrl}/?error=database_failed`)
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    if (error) {
      await Logger.logError("discord_oauth_error", error, undefined, { ip, userAgent })
      return NextResponse.redirect(`${config.baseUrl}/?error=discord_${error}`)
    }

    if (!code) {
      await Logger.logError("oauth_callback_no_code", "Authorization code missing", undefined, { ip, userAgent })
      return NextResponse.redirect(`${config.baseUrl}/?error=no_code`)
    }

    let discordUser: any
    let discordGuilds: any[]
    let userId: string
    let discordAccessToken: string

    try {
      const tokenData = await exchangeCodeForToken(code)
      discordAccessToken = tokenData.access_token
      const discord = new DiscordAPI(discordAccessToken)
      discordUser = await discord.getCurrentUser()
      discordGuilds = await discord.getUserGuilds()
      userId = discordUser.id

      await Logger.log({
        level: "info",
        event: "discord_api_success",
        userId,
        ip,
        userAgent,
        metadata: { guildCount: discordGuilds.length },
      })
    } catch (discordError) {
      const errorMessage = discordError instanceof Error ? discordError.message : "Unknown Discord API error"
      console.error("Discord API error during auth callback:", discordError)
      await Logger.logError("discord_api_error", errorMessage, undefined, { ip, userAgent })
      return NextResponse.redirect(`${config.baseUrl}/?error=discord_api_failed`)
    }

    try {
      const db = await getDatabase()

      // Construct full avatar URL
      const userAvatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar)

      // Update or insert user
      await db.collection("users").updateOne(
        { discordId: discordUser.id },
        {
          $set: {
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: userAvatarUrl, // Store full URL
            email: discordUser.email,
            guilds: discordGuilds.map((g) => g.id),
            lastLogin: new Date(),
            lastSeen: new Date(),
          },
          $setOnInsert: {
            premium: { count: 0 }, // Initialize premium count to 0 for new users
            createdAt: new Date(),
          },
        },
        { upsert: true },
      )

      const user = await db.collection("users").findOne({ discordId: discordUser.id })
      if (!user) {
        console.error("User fetch after update failed")
        throw new Error("Failed to create/update user")
      }

      // Upsert user's guilds into the 'guilds' collection
      for (const discordGuild of discordGuilds) {
        const guildIconUrl = getDiscordGuildIconUrl(discordGuild.id, discordGuild.icon)
        await db.collection("guilds").updateOne(
          { guildId: discordGuild.id },
          {
            $set: {
              guildId: discordGuild.id,
              name: discordGuild.name,
              icon: guildIconUrl, // Store full URL
              ownerId: discordGuild.owner ? user.discordId : null, // Only set if user is owner
              memberCount: 0, // Will be updated by bot or later API calls
              updatedAt: new Date(),
            },
            $setOnInsert: {
              premium: { active: false }, // Initialize guild premium to false
              createdAt: new Date(),
              config: {
                prefix: "!",
                language: "en",
                automod: false,
                logging: false,
                welcomeMessages: false,
                musicEnabled: false,
                moderationLogs: false,
                customCommands: [],
              },
            },
          },
          { upsert: true },
        )
      }

      const authToken = generateAuthToken({
        discordId: discordUser.id,
        username: discordUser.username,
      })

      await Logger.logLogin(discordUser.id, true, ip, userAgent)

      const response = NextResponse.redirect(`${config.baseUrl}/dashboard/guilds`)
      response.cookies.set(config.cookies.authToken, authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: config.cookies.maxAge,
        path: "/",
      })
      response.cookies.set(config.cookies.discordAccessToken, discordAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: config.cookies.maxAge,
        path: "/",
      })

      return response
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : "Database error"
      console.error("Database error during auth (update/find):", dbError)
      await Logger.logError("database_error", errorMessage, userId, { ip, userAgent })
      await Logger.logLogin(userId, false, ip, userAgent, errorMessage)
      return NextResponse.redirect(`${config.baseUrl}/?error=database_failed`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown callback error"
    console.error("Auth callback error (top-level catch):", error)
    await Logger.logError("auth_callback_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.redirect(`${config.baseUrl}/?error=auth_failed`)
  }
}
