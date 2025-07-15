// Test MongoDB connection script
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "discord_bot_dashboard"

async function testConnection() {
  console.log("Testing MongoDB connection...")
  console.log("URI:", MONGODB_URI.replace(/\/\/.*@/, "//***:***@")) // Hide credentials in logs

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("✅ Connected to MongoDB successfully")

    const db = client.db(DB_NAME)
    console.log(`Using database: ${DB_NAME}`)

    // Test ping
    await db.admin().ping()
    console.log("✅ Database ping successful")

    // List collections
    const collections = await db.listCollections().toArray()
    console.log(`📋 Found ${collections.length} collections:`)
    collections.forEach((col) => console.log(`  - ${col.name}`))

    // Test a simple operation
    const testResult = await db.collection("users").countDocuments()
    console.log(`👥 Users collection has ${testResult} documents`)

    console.log("🎉 All tests passed!")
  } catch (error) {
    console.error("❌ Connection failed:")
    console.error("Error:", error.message)

    if (error.message.includes("ENOTFOUND")) {
      console.error("💡 Suggestion: Check if MongoDB server is running and the hostname is correct")
    } else if (error.message.includes("authentication failed")) {
      console.error("💡 Suggestion: Check your username and password in the connection string")
    } else if (error.message.includes("timeout")) {
      console.error("💡 Suggestion: Check if MongoDB is accessible and not blocked by firewall")
    }

    process.exit(1)
  } finally {
    await client.close()
    console.log("Connection closed")
  }
}

testConnection()
