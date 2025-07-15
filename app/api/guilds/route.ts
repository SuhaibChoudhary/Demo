import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userData = await db.collection("users").findOne({ discordId: user.discordId })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's guilds
    const guilds = await db
      .collection("guilds")
      .find({
        guildId: { $in: userData.guilds },
      })
      .toArray()

    return NextResponse.json({ guilds })
  } catch (error) {
    console.error("Get guilds error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
