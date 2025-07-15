import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import { config } from "./config"

export interface AuthUser {
  discordId: string
  username: string
  avatar?: string
  premiumStatus: string
}

export interface AuthTokenPayload {
  discordId: string
  username: string
  iat: number
  exp: number
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get(config.cookies.authToken)?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload

    // Verify user still exists in database
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ discordId: decoded.discordId })

    if (!user) {
      return null
    }

    // Update last seen
    await db.collection("users").updateOne({ discordId: decoded.discordId }, { $set: { lastSeen: new Date() } })

    return {
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      premiumStatus: user.premiumStatus,
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid JWT token:", error.message)
    } else {
      console.error("Auth verification error:", error)
    }
    return null
  }
}

export function generateAuthToken(user: Pick<AuthUser, "discordId" | "username">): string {
  return jwt.sign(
    {
      discordId: user.discordId,
      username: user.username,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  )
}

export { getClientIP, getUserAgent } from "./utils"
