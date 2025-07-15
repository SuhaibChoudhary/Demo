import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { Guild } from "@/lib/models/Guild"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    console.log("API/Admin/Guilds/All: User Discord ID:", user?.discordId)
    console.log("API/Admin/Guilds/All: Config Admin Discord ID:", config.adminDiscordId)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_guilds_access_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()
    // Fetch all guilds, excluding sensitive fields if not needed
    const guilds = await db
      .collection<Guild>("guilds")
      .find(
        {},
        {
          projection: {
            _id: 1,
            guildId: 1,
            name: 1,
            icon: 1,
            ownerId: 1,
            botAdded: 1,
            premium: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray()

    await Logger.log({
      level: "info",
      event: "admin_guilds_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: guilds.length },
    })

    return NextResponse.json({ guilds })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get all guilds error"
    console.error("API/Admin/Guilds/All: Error in GET handler:", errorMessage, error) // Added console.error
    await Logger.logError("get_all_guilds_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
