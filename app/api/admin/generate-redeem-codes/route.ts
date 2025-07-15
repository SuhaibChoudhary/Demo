import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { RedeemCode } from "@/lib/models/RedeemCode"
import type { GeneratedCode } from "@/lib/models/GeneratedCode" // Declare the GeneratedCode type

// Helper to generate a random alphanumeric code
function generateRandomCode(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_redeem_code_generation_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { numCodes, plan, expiryDays } = await request.json()

    if (!numCodes || typeof numCodes !== "number" || numCodes < 1 || numCodes > 100) {
      return NextResponse.json({ error: "Invalid number of codes (1-100 allowed)" }, { status: 400 })
    }
    if (!["gold", "diamond"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan specified" }, { status: 400 })
    }
    if (expiryDays !== undefined && (typeof expiryDays !== "number" || expiryDays < 1)) {
      return NextResponse.json({ error: "Invalid expiry days" }, { status: 400 })
    }

    const db = await getDatabase()
    const generated: GeneratedCode[] = []
    const codesToInsert: RedeemCode[] = []

    for (let i = 0; i < numCodes; i++) {
      const code = generateRandomCode(20) // Generate a 20-character code
      const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined

      codesToInsert.push({
        code,
        plan,
        expiresAt,
        createdAt: new Date(),
      })
      generated.push({
        code,
        plan,
        expiresAt: expiresAt?.toISOString(),
      })
    }

    if (codesToInsert.length > 0) {
      await db.collection<RedeemCode>("redeem_codes").insertMany(codesToInsert)
    }

    await Logger.log({
      level: "info",
      event: "redeem_codes_generated",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { numCodes, plan, expiryDays, generatedCodesCount: generated.length },
    })

    return NextResponse.json({ success: true, codes: generated })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Generate redeem codes error"
    await Logger.logError("generate_redeem_codes_error", errorMessage, undefined, {
      ip,
      userAgent,
      requestBody: request.body,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
