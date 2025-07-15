export const config = {
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: process.env.DISCORD_REDIRECT_URI!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: "7d",
  },
  cookies: {
    authToken: "auth-token",
    discordAccessToken: "discord-access-token", // New: Cookie for Discord access token
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  adminDiscordId: process.env.ADMIN_DISCORD_ID, // New: Admin Discord ID for restricted access
}
