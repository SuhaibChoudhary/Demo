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
    const rawCookieHeader = request.headers.get("cookie")
    console.log("verifyAuth: Raw Cookie Header:", rawCookieHeader || "[No Cookie Header]")

    const token = request.cookies.get(config.cookies.authToken)?.value
    console.log(`verifyAuth: Looking for cookie '${config.cookies.authToken}'. Found:`, !!token)
    if (token) {
      console.log(`verifyAuth: Extracted token (first 10 chars): ${token.substring(0, 10)}...`)
    }

    if (!token) {
      console.log("verifyAuth: No auth token found in request cookies.")
      return null
    }

    if (!config.jwt.secret) {
      console.error("verifyAuth: JWT_SECRET is not configured. Cannot verify token.")
      return null
    }

    let decoded: AuthTokenPayload
    try {
      decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload
      console.log("verifyAuth: JWT decoded successfully for discordId:", decoded.discordId)
    } catch (jwtError) {
      console.error("verifyAuth: JWT verification failed:", jwtError instanceof Error ? jwtError.message : jwtError)
      return null
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ discordId: decoded.discordId })
    console.log("verifyAuth: User found in DB?", !!user)

    if (!user) {
      console.warn(`verifyAuth: User with discordId ${decoded.discordId} not found in database.`)
      return null
    }

    await db.collection("users").updateOne({ discordId: decoded.discordId }, { $set: { lastSeen: new Date() } })
    console.log(`verifyAuth: Updated lastSeen for user ${decoded.discordId}`)

    return {
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      premium: user.premium,
    }
  } catch (error) {
    console.error("verifyAuth: Auth verification error (top-level catch):", error)
    return null
  }
}

export function generateAuthToken(user: Pick<AuthUser, "discordId" | "username">): string {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not configured. Cannot generate token.")
  }
  const token = jwt.sign(
    {
      discordId: user.discordId,
      username: user.username,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  )
  console.log("generateAuthToken: Token generated. Length:", token.length)
  return token
}

export { getClientIP, getUserAgent } from "./utils"
