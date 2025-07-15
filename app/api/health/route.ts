import { NextResponse } from "next/server"
import { testConnection } from "@/lib/mongodb"

export async function GET() {
  try {
    const dbConnected = await testConnection()

    const health = {
      status: dbConnected ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(health, {
      status: dbConnected ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: "error",
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
