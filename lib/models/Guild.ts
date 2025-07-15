export interface Guild {
  _id?: string
  guildId: string
  name: string
  icon?: string
  ownerId: string
  memberCount: number
  premium: {
    active: boolean // Whether this guild is currently premium
    expiresAt?: Date // When this guild's premium status expires
  }
  botAdded: boolean // New: Indicates if the bot is in this guild
  config: GuildConfig
  createdAt: Date
  updatedAt: Date
}

export interface GuildConfig {
  prefix: string
  language: string
  automod: boolean
  logging: boolean
  logChannel?: string
  welcomeMessages: boolean
  welcomeChannel?: string // New: Channel for welcome messages
  welcomeMessage?: string // New: Custom welcome message
  musicEnabled: boolean
  moderationLogs: boolean
  moderationChannel?: string
  customCommands: CustomCommand[]
}

export interface CustomCommand {
  name: string
  response: string
  enabled: boolean
  createdBy: string
  createdAt: Date
}
