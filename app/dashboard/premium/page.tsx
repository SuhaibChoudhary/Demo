"use client"

import { useState, useEffect } from "react"
import { Crown, Check, Zap, Star, Shield, XCircle, CheckCircle, Gift } from "lucide-react" // Added Gift icon
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Added Input
import type { PremiumPlan } from "@/lib/models/PremiumPlan" // Import PremiumPlan

const plans: PremiumPlan[] = [
  {
    count: 1,
    price: 3,
    features: ["1 Premium Slot", "Basic moderation", "Standard support", "Core commands"],
  },
  {
    count: 2,
    price: 5,
    popular: true,
    features: ["2 Premium Slots", "Advanced moderation", "Priority support", "Custom commands", "Music features"],
  },
  {
    count: 4,
    price: 9,
    features: [
      "4 Premium Slots",
      "AI-powered moderation",
      "24/7 premium support",
      "Custom branding",
      "Advanced analytics",
    ],
  },
]

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [userPremium, setUserPremium] = useState<{ count: number; expiresAt?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [redeemCode, setRedeemCode] = useState("") // State for redeem code input
  const [isRedeeming, setIsRedeeming] = useState(false) // State for redeem button loading

  useEffect(() => {
    fetchUserPremiumStatus()
  }, [])

  const fetchUserPremiumStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUserPremium(data.user.premium)
      } else {
        setMessage({ type: "error", text: "Failed to load your premium status." })
      }
    } catch (error) {
      console.error("Failed to fetch premium status:", error)
      setMessage({ type: "error", text: "An error occurred while loading premium status." })
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    setIsRedeeming(true)
    setMessage(null) // Clear previous messages
    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: redeemCode }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: "success", text: data.message })
        setUserPremium({ count: data.newPremiumCount, expiresAt: data.newPremiumExpiry })
        setRedeemCode("") // Clear input on success
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "Failed to redeem code." })
      }
    } catch (error) {
      console.error("Error redeeming code:", error)
      setMessage({ type: "error", text: "An unexpected error occurred during redemption." })
    } finally {
      setIsRedeeming(false)
    }
  }

  const isPremiumActive = userPremium?.expiresAt && new Date(userPremium.expiresAt) > new Date()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading premium plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 neumorphic rounded-2xl mb-4">
          <Crown className="w-8 h-8 text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Unlock Premium Features</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Purchase premium slots to activate advanced features on your Discord servers.
        </p>
      </div>

      {/* User's Current Premium Status */}
      <div className="neumorphic rounded-2xl p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Your Current Premium</h2>
        <p className="text-foreground text-lg mb-2">
          Available Slots: <span className="font-semibold text-white">{userPremium?.count || 0}</span>
        </p>
        {isPremiumActive && userPremium?.expiresAt ? (
          <p className="text-foreground text-sm">
            Subscription active until:{" "}
            <span className="font-semibold text-white">{new Date(userPremium.expiresAt).toLocaleDateString()}</span>
          </p>
        ) : (
          <p className="text-foreground text-sm">No active premium subscription.</p>
        )}
        {message && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center justify-center ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500/30 text-green-200"
                : "bg-red-500/20 border border-red-500/30 text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </div>

      {/* Redeem Code Section */}
      <div className="neumorphic rounded-2xl p-6 mb-8">
        <div className="flex items-center mb-6">
          <Gift className="w-6 h-6 text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Redeem a Code</h2>
        </div>
        <p className="text-foreground text-sm mb-4">
          Have a premium redeem code? Enter it below to activate your slots!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter your redeem code"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value)}
            className="flex-1 neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
            disabled={isRedeeming}
          />
          <Button
            onClick={handleRedeemCode}
            disabled={isRedeeming || redeemCode.trim() === ""}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium"
          >
            {isRedeeming ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Redeeming...
              </div>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Redeem
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="neumorphic rounded-xl p-1 flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
                : "text-foreground hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
                : "text-foreground hover:text-white"
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.count}
            className={`
              relative neumorphic rounded-2xl p-8 transition-all duration-200
              ${plan.popular ? "ring-2 ring-primary-500 scale-105" : ""}
              hover:scale-105
            `}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.count} Premium Slots</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-white">
                  {billingCycle === "yearly" ? `$${(plan.price * 12 * 0.8).toFixed(2)}` : `$${plan.price.toFixed(2)}`}
                </span>
                <span className="text-foreground ml-2">/{billingCycle === "yearly" ? "year" : "month"}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`
                w-full py-3 rounded-xl font-medium transition-all duration-200
                ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white animate-glow"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }
              `}
            >
              Purchase {plan.count} Slots
            </Button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="neumorphic rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Choose Premium?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-foreground">Premium servers get priority processing for faster response times</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
            <p className="text-foreground">AI-powered moderation and advanced security features</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium Support</h3>
            <p className="text-foreground">Get priority support from our dedicated team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
