import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import type { RedeemCode } from "@/lib/models/RedeemCode"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_redeem_attempt",
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Redeem code is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const redeemCode = await db.collection<RedeemCode>("redeem_codes").findOne({ code })

    if (!redeemCode) {
      await Logger.log({
        level: "warn",
        event: "redeem_code_not_found",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { code },
      })
      return NextResponse.json({ error: "Invalid or expired redeem code" }, { status: 404 })
    }

    if (redeemCode.usedBy) {
      await Logger.log({
        level: "warn",
        event: "redeem_code_already_used",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { code, usedBy: redeemCode.usedBy },
      })
      return NextResponse.json({ error: "Redeem code already used" }, { status: 400 })
    }

    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      await Logger.log({
        level: "warn",
        event: "redeem_code_expired",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { code, expiresAt: redeemCode.expiresAt },
      })
      return NextResponse.json({ error: "Invalid or expired redeem code" }, { status: 400 })
    }

    // Update user's premium status
    const currentUser = await db.collection<User>("users").findOne({ discordId: user.discordId })
    if (!currentUser) {
      await Logger.logError("redeem_user_not_found", "User not found for premium update", user.discordId, {
        ip,
        userAgent,
        code,
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newPremiumCount = (currentUser.premium?.count || 0) + redeemCode.premiumCount
    let newPremiumExpiry = currentUser.premium?.expiresAt || new Date()

    // If the current premium is expired or doesn't exist, set new expiry from now
    // Otherwise, extend the existing expiry
    if (newPremiumExpiry < new Date()) {
      newPremiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days from now
    } else {
      newPremiumExpiry = new Date(newPremiumExpiry.getTime() + 30 * 24 * 60 * 60 * 1000) // Extend by 30 days
    }

    const userUpdateResult = await db.collection("users").updateOne(
      { discordId: user.discordId },
      {
        $set: {
          "premium.count": newPremiumCount,
          "premium.expiresAt": newPremiumExpiry,
          lastSeen: new Date(),
        },
      },
    )

    if (userUpdateResult.matchedCount === 0) {
      await Logger.logError("redeem_user_not_found", "User not found for premium update", user.discordId, {
        ip,
        userAgent,
        code,
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mark redeem code as used
    await db.collection<RedeemCode>("redeem_codes").updateOne(
      { _id: redeemCode._id },
      {
        $set: {
          usedBy: user.discordId,
          usedAt: new Date(),
        },
      },
    )

    await Logger.log({
      level: "info",
      event: "redeem_code_success",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { code, premiumCountGranted: redeemCode.premiumCount },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed code for ${redeemCode.premiumCount} premium slots!`,
      newPremiumCount: newPremiumCount,
      newPremiumExpiry: newPremiumExpiry.toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Redeem code error"
    await Logger.logError("redeem_code_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      requestBody: request.body,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
