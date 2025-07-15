import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import { config } from "./config"

export interface AuthUser {
  discordId: string
  username: string
  avatar?: string
  premium: {
    count: number
    expiresAt?: Date
  }
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
    console.log("verifyAuth: Token found in cookies?", !!token) // Log if token exists

    if (!token) {
      return null
    }

    if (!config.jwt.secret) {
      console.error("verifyAuth: JWT_SECRET is not configured. Please ensure it's set in your environment variables.")
      return null // Cannot verify without a secret
    }

    // Verify JWT token
    let decoded: AuthTokenPayload
    try {
      decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload
      console.log("verifyAuth: JWT decoded successfully for discordId:", decoded.discordId)
    } catch (jwtError) {
      console.error("verifyAuth: JWT verification failed:", jwtError)
      return null
    }

    // Verify user still exists in database
    const db = await getDatabase()
    const user = await db.collection("users").findOne({ discordId: decoded.discordId })
    console.log("verifyAuth: User found in DB?", !!user)

    if (!user) {
      console.warn(`verifyAuth: User with discordId ${decoded.discordId} not found in database.`)
      return null
    }

    // Update last seen
    await db.collection("users").updateOne({ discordId: decoded.discordId }, { $set: { lastSeen: new Date() } })
    console.log(`verifyAuth: Updated lastSeen for user ${decoded.discordId}`)

    return {
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      premium: user.premium,
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("verifyAuth: Invalid JWT token:", error.message)
    } else {
      console.error("verifyAuth: Auth verification error (top-level catch):", error)
    }
    return null
  }
}

export function generateAuthToken(user: Pick<AuthUser, "discordId" | "username">): string {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not configured. Cannot generate token.")
  }
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
