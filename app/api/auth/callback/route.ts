import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { exchangeCodeForToken, DiscordAPI, DiscordPermissions } from "@/lib/discord"
import { signJwt } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { User } from "@/lib/models/User"
import type { Guild } from "@/lib/models/Guild"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") // For CSRF protection

    if (!code) {
      await Logger.log({
        level: "warn",
        event: "oauth_callback_no_code",
        ip,
        userAgent,
      })
      return NextResponse.redirect(new URL("/login?error=no_code", request.url))
    }

    // TODO: Implement state verification for CSRF protection
    // if (!state || state !== storedState) {
    //   return NextResponse.redirect(new URL("/login?error=csrf_mismatch", request.url));
    // }

    const tokenResponse = await exchangeCodeForToken(code)
    const discordApi = new DiscordAPI(tokenResponse.access_token)
    const discordUser = await discordApi.getCurrentUser()
    const discordGuilds = await discordApi.getUserGuilds()

    const db = await getDatabase()

    // Upsert user data
    const userUpdateResult = await db.collection<User>("users").updateOne(
      { discordId: discordUser.id },
      {
        $set: {
          username: discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          email: discordUser.email,
          lastLogin: new Date(),
          lastSeen: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          premium: { count: 0 }, // Initialize premium for new users
          guilds: [], // Initialize guilds array for new users
        },
      },
      { upsert: true },
    )

    // Fetch the updated user document
    const user = await db.collection<User>("users").findOne({ discordId: discordUser.id })

    if (!user) {
      await Logger.logError("auth_callback_user_not_found", "User not found after upsert", discordUser.id, {
        ip,
        userAgent,
      })
      return NextResponse.redirect(new URL("/login?error=user_creation_failed", request.url))
    }

    // Update user's guilds and upsert guild data
    const userGuildIds: string[] = []
    for (const guild of discordGuilds) {
      userGuildIds.push(guild.id)

      // Check if the user has manage guild or admin permissions
      const canManage =
        guild.owner ||
        DiscordPermissions.ADMINISTRATOR === (Number.parseInt(guild.permissions) & DiscordPermissions.ADMINISTRATOR) ||
        DiscordPermissions.MANAGE_GUILD === (Number.parseInt(guild.permissions) & DiscordPermissions.MANAGE_GUILD)

      await db.collection<Guild>("guilds").updateOne(
        { guildId: guild.id },
        {
          $set: {
            name: guild.name,
            icon: guild.icon,
            ownerId: guild.owner ? user.discordId : "unknown", // Set ownerId if user is owner
            // botAdded: false, // Bot status should be updated by the bot itself
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
            premium: { active: false },
            config: {
              prefix: "!",
              language: "en",
              automod: false,
              logging: false,
              welcomeMessages: false,
              musicEnabled: false,
              moderationLogs: false,
            },
            botAdded: false, // Default to false, bot will update this
          },
        },
        { upsert: true },
      )
    }

    // Update the user's list of guilds
    await db.collection<User>("users").updateOne(
      { discordId: user.discordId },
      {
        $set: { guilds: userGuildIds },
      },
    )

    // Generate JWT
    const jwt = await signJwt({
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
    })

    // Set JWT as a cookie
    cookies().set("token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenResponse.expires_in, // Match Discord token expiry
      path: "/",
      sameSite: "lax",
    })

    await Logger.log({
      level: "info",
      event: "user_logged_in",
      userId: user.discordId,
      ip,
      userAgent,
    })

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "OAuth callback error"
    await Logger.logError("oauth_callback_failed", errorMessage, undefined, {
      ip,
      userAgent,
      requestUrl: request.url,
    })
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url))
  }
}
