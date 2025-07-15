import { MongoClient, type MongoClientOptions, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

// ✅  Only use options that are still supported by MongoDB driver v6
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 45_000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    const db = client.db("discord_bot_dashboard")
    await db.admin().ping()
    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const db = await getDatabase()
    await db.admin().ping()
    console.log("MongoDB connection successful")
    return true
  } catch (error) {
    console.error("MongoDB connection test failed:", error)
    return false
  }
}
