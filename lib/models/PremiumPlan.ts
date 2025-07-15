export interface PremiumPlan {
  count: number // Number of premium slots this plan grants
  price: number // Price in dollars
  features: string[]
  popular?: boolean
}
