// MongoDB setup script for Discord Bot Dashboard
// This script creates the necessary collections and indexes

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "discord_bot_dashboard"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Create collections
    const collections = [
      "users",
      "guilds",
      "premium_subscriptions",
      "notifications",
      "audit_logs",
      "custom_commands",
      "logs",
      "redeem_codes", // New collection for redeem codes
    ]

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`)
        } else {
          throw error
        }
      }
    }

    // Create indexes
    await db.collection("users").createIndex({ discordId: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 }, { sparse: true })
    await db.collection("users").createIndex({ lastSeen: -1 })

    await db.collection("guilds").createIndex({ guildId: 1 }, { unique: true })
    await db.collection("guilds").createIndex({ ownerId: 1 })

    await db.collection("premium_subscriptions").createIndex({ userId: 1 })
    await db.collection("notifications").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("audit_logs").createIndex({ guildId: 1, timestamp: -1 })
    await db.collection("custom_commands").createIndex({ guildId: 1, name: 1 }, { unique: true })

    // New indexes for logs collection
    await db.collection("logs").createIndex({ timestamp: -1 })
    await db.collection("logs").createIndex({ userId: 1, timestamp: -1 })
    await db.collection("logs").createIndex({ event: 1, timestamp: -1 })
    await db.collection("logs").createIndex({ level: 1, timestamp: -1 })

    // New indexes for redeem_codes collection
    await db.collection("redeem_codes").createIndex({ code: 1 }, { unique: true })
    await db.collection("redeem_codes").createIndex({ usedBy: 1 }, { sparse: true })
    await db.collection("redeem_codes").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic expiry

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
