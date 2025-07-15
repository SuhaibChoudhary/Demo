export interface RedeemCode {
  _id?: string
  code: string // The actual redeem code string
  plan: "gold" | "diamond" // The premium plan this code grants
  expiresAt?: Date // Optional expiry date for the code
  usedBy?: string // Discord ID of the user who used it
  usedAt?: Date // Timestamp when the code was used
  createdAt: Date
}
