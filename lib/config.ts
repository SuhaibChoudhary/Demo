export const config = {
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  discord: {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!, // Changed to NEXT_PUBLIC_
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!, // Changed to NEXT_PUBLIC_
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

// Sanity check for JWT_SECRET
if (!config.jwt.secret || config.jwt.secret.length < 32) {
  console.warn(
    "WARNING: JWT_SECRET is either missing or too short. This is a security risk and can cause authentication issues. Please set a long, random string for JWT_SECRET in your environment variables.",
  )
}
