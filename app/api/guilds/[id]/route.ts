import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const guild = await db.collection("guilds").findOne({ guildId: params.id })

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Check if user has access to this guild
    const userData = await db.collection("users").findOne({ discordId: user.discordId })
    if (!userData?.guilds.includes(params.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({ guild })
  } catch (error) {
    console.error("Get guild error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { config } = body

    const db = await getDatabase()

    // Check if user has access to this guild
    const userData = await db.collection("users").findOne({ discordId: user.discordId })
    if (!userData?.guilds.includes(params.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update guild configuration
    const result = await db.collection("guilds").findOneAndUpdate(
      { guildId: params.id },
      {
        $set: {
          config: {
            prefix: config.prefix || "!",
            language: config.language || "en",
            automod: config.automod || false,
            logging: config.logging || false,
            logChannel: config.logChannel,
            welcomeMessages: config.welcomeMessages || false,
            welcomeChannel: config.welcomeChannel,
            musicEnabled: config.musicEnabled || false,
            moderationLogs: config.moderationLogs || false,
            moderationChannel: config.moderationChannel,
            customCommands: config.customCommands || [],
          },
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 })
    }

    // Log the configuration change
    await db.collection("audit_logs").insertOne({
      guildId: params.id,
      userId: user.discordId,
      action: "config_update",
      changes: config,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      guild: result.value,
    })
  } catch (error) {
    console.error("Update guild error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
