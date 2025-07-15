import { config } from "./config"

const DISCORD_API_BASE = "https://discord.com/api/v10"
const DISCORD_CDN_BASE = "https://cdn.discordapp.com"

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string // This is the avatar hash
  email?: string
}

export interface DiscordGuild {
  id: string
  name: string
  icon?: string // This is the icon hash
  owner: boolean
  permissions: string // Bitfield string
  features: string[]
}

export interface DiscordTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

// Discord Permission Flags (common ones for guild management)
export enum DiscordPermissions {
  ADMINISTRATOR = 1 << 3, // 8
  MANAGE_GUILD = 1 << 5, // 32
  // Add other permissions as needed
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

// Helper to get full Discord avatar URL
export function getDiscordAvatarUrl(userId: string, avatarHash?: string | null): string {
  if (avatarHash) {
    // Check if it's an animated GIF (starts with 'a_')
    const format = avatarHash.startsWith("a_") ? "gif" : "png"
    return `${DISCORD_CDN_BASE}/avatars/${userId}/${avatarHash}.${format}?size=128`
  }
  // Default Discord avatar if no custom avatar is set
  // This is a generic default, Discord also has specific default avatars based on discriminator
  return `${DISCORD_CDN_BASE}/embed/avatars/0.png` // A common default placeholder
}

// Helper to get full Discord guild icon URL
export function getDiscordGuildIconUrl(guildId: string, iconHash?: string | null): string {
  if (iconHash) {
    const format = iconHash.startsWith("a_") ? "gif" : "png"
    return `${DISCORD_CDN_BASE}/icons/${guildId}/${iconHash}.${format}?size=128`
  }
  return `/placeholder.svg?height=48&width=48` // Fallback to local placeholder
}

// Helper to check if a user has a specific Discord permission
export function hasDiscordPermission(userPermissions: string, requiredPermission: DiscordPermissions): boolean {
  const permissionsInt = Number.parseInt(userPermissions)
  return (permissionsInt & requiredPermission) === requiredPermission
}
