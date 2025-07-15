import { NextResponse } from "next/server"
import { getDiscordOAuthURL } from "@/lib/discord"

export async function GET() {
  const authUrl = getDiscordOAuthURL()
  return NextResponse.redirect(authUrl)
}
