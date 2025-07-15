import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { RedeemCode } from "@/lib/models/RedeemCode"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_add_redeem_code_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { premiumCount, expiryDays, quantity } = await request.json()

    if (!premiumCount || typeof premiumCount !== "number" || premiumCount <= 0) {
      return NextResponse.json({ error: "Valid premiumCount (number > 0) is required" }, { status: 400 })
    }
    if (!quantity || typeof quantity !== "number" || quantity <= 0 || quantity > 100) {
      return NextResponse.json({ error: "Valid quantity (number 1-100) is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const newCodes: RedeemCode[] = []

    for (let i = 0; i < quantity; i++) {
      const code =
        Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 10).toUpperCase() // Generate a random code
      const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined

      const redeemCode: RedeemCode = {
        code,
        premiumCount,
        createdAt: new Date(),
        createdBy: user.discordId,
        expiresAt,
      }
      newCodes.push(redeemCode)
    }

    await db.collection<RedeemCode>("redeem_codes").insertMany(newCodes)

    await Logger.log({
      level: "info",
      event: "admin_redeem_codes_added",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { count: quantity, premiumCount, expiryDays },
    })

    return NextResponse.json({
      success: true,
      message: `${quantity} redeem codes generated and added.`,
      codes: newCodes.map((c) => c.code),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Add redeem code error"
    await Logger.logError("add_redeem_code_internal_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
