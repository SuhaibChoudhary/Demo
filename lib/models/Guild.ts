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
    logChannelId?: string // New: Channel ID for logging
    welcomeMessages: boolean
    welcomeChannelId?: string // New: Channel ID for welcome messages
    welcomeMessage?: string // New: Custom welcome message content
    musicEnabled: boolean
    moderationLogs: boolean
    moderationChannelId?: string // New: Channel ID for moderation logs
    youtubeEnabled: boolean // New
    giveawayEnabled: boolean // New
    announcementChannelId?: string // New
    autoRoleEnabled: boolean // New
    autoRoleId?: string // New
    customCommands: { name: string; response: string }[] // Existing, but ensure type is here
  }
  createdAt: Date
  updatedAt: Date
}
