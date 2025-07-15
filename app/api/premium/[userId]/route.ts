import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const user = await verifyAuth(request)

    if (!user || user.discordId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userData = await db.collection("users").findOne({ discordId: params.userId })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const premiumData = {
      plan: userData.premiumStatus,
      expiry: userData.premiumExpiry,
      features: getPremiumFeatures(userData.premiumStatus),
    }

    return NextResponse.json({ premium: premiumData })
  } catch (error) {
    console.error("Get premium error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getPremiumFeatures(plan: string) {
  const features = {
    free: {
      maxServers: 5,
      customCommands: 10,
      support: "Community",
      features: ["Basic moderation", "Standard support", "Core commands"],
    },
    gold: {
      maxServers: 25,
      customCommands: 50,
      support: "Priority",
      features: ["Advanced moderation", "Priority support", "Custom commands", "Music features", "Welcome messages"],
    },
    diamond: {
      maxServers: -1, // Unlimited
      customCommands: -1, // Unlimited
      support: "24/7 Premium",
      features: [
        "AI-powered moderation",
        "24/7 premium support",
        "Custom branding",
        "Advanced analytics",
        "API access",
        "Beta features",
      ],
    },
  }

  return features[plan as keyof typeof features] || features.free
}
