import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { Guild } from "@/lib/models/Guild"

// This API route is intended to be called by your actual Discord bot
// to update the bot's presence status in guilds.
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const { guildId, botAdded } = await request.json()

    if (!guildId || typeof botAdded === "undefined") {
      return NextResponse.json({ error: "guildId and botAdded are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection<Guild>("guilds").updateOne(
      { guildId },
      {
        $set: {
          botAdded: botAdded,
          updatedAt: new Date(),
        },
      },
      { upsert: true }, // Upsert if guild doesn't exist (e.g., bot added before user logs in)
    )

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      await Logger.log({
        level: "warn",
        event: "bot_guild_status_no_change",
        ip,
        userAgent,
        metadata: { guildId, botAdded },
      })
      return NextResponse.json({ message: "No change or guild not found/upserted" }, { status: 200 })
    }

    await Logger.log({
      level: "info",
      event: "bot_guild_status_updated",
      ip,
      userAgent,
      metadata: { guildId, botAdded },
    })

    return NextResponse.json({ success: true, message: "Guild bot status updated" })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Bot guild status update error"
    await Logger.logError("bot_guild_status_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      requestBody: request.body,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
