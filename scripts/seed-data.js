// Seed script to populate the database with sample data

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "discord_bot_dashboard"

const sampleData = {
  users: [
    {
      discord_id: "123456789012345678",
      username: "DiscordUser#1234",
      email: "user@example.com",
      avatar: "https://cdn.discordapp.com/avatars/123456789012345678/avatar.png",
      premium: {
        count: 2, // User has 2 premium slots
        expiresAt: new Date("2025-12-31"),
      },
      created_at: new Date("2023-01-15"),
      last_login: new Date(),
    },
  ],

  guilds: [
    {
      guild_id: "987654321098765432",
      name: "Awesome Gaming Server",
      icon: "https://cdn.discordapp.com/icons/987654321098765432/icon.png",
      owner_id: "123456789012345678",
      member_count: 1250,
      premium: {
        active: true, // This guild is premium
        expiresAt: new Date("2025-12-31"),
      },
      bot_added: true,
      created_at: new Date("2023-02-01"),
    },
    {
      guild_id: "876543210987654321",
      name: "Dev Community",
      icon: "https://cdn.discordapp.com/icons/876543210987654321/icon.png",
      owner_id: "123456789012345678",
      member_count: 890,
      premium: {
        active: false, // This guild is not premium
        expiresAt: undefined,
      },
      bot_added: true,
      created_at: new Date("2023-03-15"),
    },
  ],

  guild_configs: [
    {
      guild_id: "987654321098765432",
      prefix: "!",
      language: "en",
      automod: true,
      logging: true,
      welcome_messages: true,
      music_enabled: true,
      moderation_logs: true,
      updated_at: new Date(),
    },
    {
      guild_id: "876543210987654321",
      prefix: "?",
      language: "en",
      automod: false,
      logging: true,
      welcome_messages: false,
      music_enabled: true,
      moderation_logs: false,
      updated_at: new Date(),
    },
  ],

  notifications: [
    {
      user_id: "123456789012345678",
      type: "info",
      title: "New Feature Available",
      message: "Auto-moderation 2.0 is now live with improved detection.",
      read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      user_id: "123456789012345678",
      type: "success",
      title: "Premium Activated",
      message: "Your Gold plan is now active. Enjoy premium features!",
      read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ],
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Insert sample data
    for (const [collectionName, data] of Object.entries(sampleData)) {
      // Clear existing data before inserting new
      await db.collection(collectionName).deleteMany({})
      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data)
        console.log(`Inserted ${data.length} documents into ${collectionName}`)
      }
    }

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
