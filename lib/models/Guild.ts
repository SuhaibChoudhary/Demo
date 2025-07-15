export interface Guild {
  _id?: string
  guildId: string
  name: string
  icon?: string
  ownerId: string // Discord ID of the guild owner
  botAdded: boolean // Indicates if the bot is currently in this guild
  premium: {
    active: boolean
    expiresAt?: Date
  }
  config: {
    prefix: string
    language: string
    automod: boolean
    logging: boolean
    welcomeMessages: boolean
    welcomeChannel?: string // New: Channel ID for welcome messages
    welcomeMessage?: string // New: Custom welcome message content
    musicEnabled: boolean
    moderationLogs: boolean
  }
  createdAt: Date
  updatedAt: Date
}
