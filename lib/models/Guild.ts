export interface Guild {
  _id?: string
  guildId: string
  name: string
  icon?: string
  ownerId: string
  memberCount: number
  botAdded: boolean
  premiumStatus: boolean
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
  welcomeChannel?: string
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
