import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_user_premium_update_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
        metadata: { targetUserId: params.id },
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { premiumCount, expiryDays } = await request.json()

    if (typeof premiumCount !== "number" || premiumCount < 0) {
      return NextResponse.json({ error: "Invalid premiumCount. Must be a non-negative number." }, { status: 400 })
    }
    if (expiryDays !== undefined && (typeof expiryDays !== "number" || expiryDays < 0)) {
      return NextResponse.json(
        { error: "Invalid expiryDays. Must be a non-negative number or undefined." },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const targetUser = await db.collection<User>("users").findOne({ discordId: params.id })

    if (!targetUser) {
      await Logger.log({
        level: "warn",
        event: "admin_user_premium_update_user_not_found",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { targetUserId: params.id, premiumCount, expiryDays },
      })
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    let newExpiresAt: Date | undefined = undefined
    if (expiryDays !== undefined) {
      if (expiryDays === 0) {
        newExpiresAt = undefined // No expiry
      } else {
        newExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
      }
    } else if (targetUser.premium?.expiresAt) {
      newExpiresAt = targetUser.premium.expiresAt // Keep existing expiry if not provided
    }

    const updateResult = await db.collection<User>("users").updateOne(
      { discordId: params.id },
      {
        $set: {
          "premium.count": premiumCount,
          "premium.expiresAt": newExpiresAt,
          lastSeen: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      await Logger.logError(
        "admin_user_premium_update_failed",
        "Failed to update user premium status",
        user.discordId,
        {
          ip,
          userAgent,
          targetUserId: params.id,
          premiumCount,
          expiryDays,
        },
      )
      return NextResponse.json({ error: "Failed to update user premium." }, { status: 500 })
    }

    await Logger.log({
      level: "info",
      event: "admin_user_premium_updated",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { targetUserId: params.id, premiumCount, newExpiresAt },
    })

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.username}'s premium updated successfully.`,
      newPremiumCount: premiumCount,
      newPremiumExpiry: newExpiresAt?.toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Update user premium error"
    await Logger.logError("admin_user_premium_update_internal_error", errorMessage, undefined, {
      ip,
      userAgent,
      requestBody: request.body,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
