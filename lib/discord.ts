import { config } from "./config"

const DISCORD_API_BASE = "https://discord.com/api/v10"

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
}

export interface DiscordGuild {
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
  features: string[]
}

export interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export class DiscordAPI {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string) {
    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Discord API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<DiscordUser> {
    return this.request("/users/@me")
  }

  async getUserGuilds(): Promise<DiscordGuild[]> {
    return this.request("/users/@me/guilds")
  }

  async getGuild(guildId: string) {
    return this.request(`/guilds/${guildId}`)
  }
}

export function getDiscordOAuthURL(): string {
  const params = new URLSearchParams({
    client_id: config.discord.clientId,
    redirect_uri: config.discord.redirectUri,
    response_type: "code",
    scope: "identify email guilds",
    state: generateState(), // CSRF protection
  })

  return `https://discord.com/api/oauth2/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.discord.redirectUri,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`)
  }

  return response.json()
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
