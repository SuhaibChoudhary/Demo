import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { RedeemCode } from "@/lib/models/RedeemCode"

export async function GET(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_redeem_codes_access_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()
    const redeemCodes = await db.collection<RedeemCode>("redeem_codes").find({}).sort({ createdAt: -1 }).toArray()

    await Logger.log({
      level: "info",
      event: "admin_redeem_codes_accessed",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: redeemCodes.length },
    })

    return NextResponse.json({ codes: redeemCodes })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Get all redeem codes error"
    await Logger.logError("get_all_redeem_codes_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
