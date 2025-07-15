import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils" // Assuming these functions are declared in a utils file

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_guilds_access",
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userData = await db.collection("users").findOne({ discordId: user.discordId })

    if (!userData) {
      await Logger.logError("user_not_found_for_guilds", "User data missing from database", user.discordId, {
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch all guilds that the user is a member of (based on the 'guilds' array in the user document)
    const guilds = await db
      .collection("guilds")
      .find({
        guildId: { $in: userData.guilds || [] },
      })
      .toArray()

    await Logger.log({
      level: "info",
      event: "user_guilds_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { guildCount: guilds.length },
    })

    return NextResponse.json({ guilds })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get guilds error"
    await Logger.logError("get_guilds_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
