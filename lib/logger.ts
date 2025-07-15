import { getDatabase } from "./mongodb"

export interface LogEntry {
  level: "info" | "warn" | "error"
  event: string
  userId?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: Date
}

export class Logger {
  static async log(entry: Omit<LogEntry, "timestamp">) {
    try {
      const db = await getDatabase()
      await db.collection("logs").insertOne({
        ...entry,
        timestamp: new Date(),
      })
    } catch (error) {
      // Fallback to console logging if database is unavailable
      console.error("Failed to log to database:", error)
      console.log("Log entry:", { ...entry, timestamp: new Date() })
    }
  }

  static async logLogin(userId: string, success: boolean, ip?: string, userAgent?: string, error?: string) {
    await this.log({
      level: success ? "info" : "error",
      event: success ? "login_success" : "login_failed",
      userId,
      ip,
      userAgent,
      metadata: error ? { error } : undefined,
    })
  }

  static async logLogout(userId: string, ip?: string, userAgent?: string) {
    await this.log({
      level: "info",
      event: "logout",
      userId,
      ip,
      userAgent,
    })
  }

  static async logError(event: string, error: string, userId?: string, metadata?: Record<string, any>) {
    await this.log({
      level: "error",
      event,
      userId,
      metadata: { error, ...metadata },
    })
  }
}
