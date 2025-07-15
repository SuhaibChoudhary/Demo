import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"
import { getClientIP, getUserAgent } from "@/lib/utils"
import { config } from "@/lib/config"
import { ObjectId } from "mongodb" // Import ObjectId

export async function DELETE(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = getUserAgent(request)

  try {
    const user = await verifyAuth(request)

    // Admin check
    if (!user || user.discordId !== config.adminDiscordId) {
      await Logger.log({
        level: "warn",
        event: "unauthorized_admin_delete_redeem_code_attempt",
        userId: user?.discordId,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { id } = await request.json() // Expecting the _id of the redeem code

    if (!id) {
      return NextResponse.json({ error: "Redeem code ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("redeem_codes").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      await Logger.log({
        level: "warn",
        event: "admin_redeem_code_delete_not_found",
        userId: user.discordId,
        ip,
        userAgent,
        metadata: { id },
      })
      return NextResponse.json({ error: "Redeem code not found" }, { status: 404 })
    }

    await Logger.log({
      level: "info",
      event: "admin_redeem_code_deleted",
      userId: user.discordId,
      ip,
      userAgent,
      metadata: { id },
    })

    return NextResponse.json({ success: true, message: "Redeem code deleted successfully." })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Delete redeem code error"
    await Logger.logError("delete_redeem_code_internal_error", errorMessage, undefined, { ip, userAgent })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
