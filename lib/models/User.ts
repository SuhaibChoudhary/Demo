export interface User {
  _id?: string
  discordId: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  premiumStatus: "free" | "gold" | "diamond"
  premiumExpiry?: Date
  guilds: string[]
  createdAt: Date
  lastLogin: Date
}

export interface UserStats {
  totalGuilds: number
  totalMembers: number
  premiumGuilds: number
}
