import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"
import { config } from "./config"
import { getClientIP, getUserAgent } from "./utils" // <-- helper functions

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface AuthUser {
  discordId: string
  username: string
  avatar?: string
  premium: { count: number; expiresAt?: Date }
}

export interface AuthTokenPayload {
  discordId: string
  username: string
  iat: number
  exp: number
}

/* ------------------------------------------------------------------ */
/* Verification logic                                                  */
/* ------------------------------------------------------------------ */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(config.cookies.authToken)?.value
  if (!token || !config.jwt.secret) return null

  let decoded: AuthTokenPayload
  try {
    decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload
  } catch {
    return null
  }

  // Look the user up in Mongo
  const db = await getDatabase()
  const user = await db.collection("users").findOne({ discordId: decoded.discordId })
  if (!user) return null

  // update lastSeen asynchronously
  db.collection("users").updateOne({ discordId: decoded.discordId }, { $set: { lastSeen: new Date() } })

  return {
    discordId: user.discordId,
    username: user.username,
    avatar: user.avatar,
    premium: user.premium,
  }
}

/* ------------------------------------------------------------------ */
/* Token creation helpers                                              */
/* ------------------------------------------------------------------ */
export function generateAuthToken(user: Pick<AuthUser, "discordId" | "username">): string {
  if (!config.jwt.secret) throw new Error("JWT_SECRET missing")
  return jwt.sign({ discordId: user.discordId, username: user.username }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

/* ------------------------------------------------------------------ */
/* Export helpers & legacy aliases                                    */
/* ------------------------------------------------------------------ */
export { getClientIP, getUserAgent } // named helper exports
export { generateAuthToken as signJwt } // legacy alias for older imports
