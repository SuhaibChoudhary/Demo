export interface User {
  _id?: string
  discordId: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  premium: {
    count: number // Number of premium slots the user has
    expiresAt?: Date // When the user's premium subscription expires
  }
  guilds: string[]
  createdAt: Date
  lastLogin: Date
  lastSeen?: Date
}

export interface UserStats {
  totalGuilds: number
  totalMembers: number
  premiumGuilds: number
}
