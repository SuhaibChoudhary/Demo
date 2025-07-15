"use client"

import { useState, useEffect } from "react"
import { Crown, Check, Zap, Star, Shield, Gift, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    current: false,
    features: ["Up to 5 servers", "Basic moderation", "Standard support", "Core commands"],
    color: "gray",
  },
  {
    name: "Gold",
    price: "$4.99",
    period: "month",
    popular: true,
    features: [
      "Up to 25 servers",
      "Advanced moderation",
      "Priority support",
      "Custom commands",
      "Music features",
      "Welcome messages",
    ],
    color: "yellow",
  },
  {
    name: "Diamond",
    price: "$9.99",
    period: "month",
    features: [
      "Unlimited servers",
      "AI-powered moderation",
      "24/7 premium support",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "Beta features",
    ],
    color: "blue",
  },
]

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [currentPlan, setCurrentPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [redeemCode, setRedeemCode] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchPremiumStatus()
  }, [])

  const fetchPremiumStatus = async () => {
    setLoading(true)
    try {
      const userResponse = await fetch("/api/user")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setCurrentPlan(userData.user.premiumStatus)
      }
    } catch (error) {
      console.error("Failed to fetch premium status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemCode = async () => {
    setIsRedeeming(true)
    setRedeemMessage(null)
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
        setRedeemMessage({ type: "success", text: data.message })
        setCurrentPlan(data.newPlan) // Update current plan immediately
        setRedeemCode("") // Clear input
      } else {
        const errorData = await response.json()
        setRedeemMessage({ type: "error", text: errorData.error || "Failed to redeem code." })
      }
    } catch (error) {
      console.error("Error redeeming code:", error)
      setRedeemMessage({ type: "error", text: "An error occurred during redemption." })
    } finally {
      setIsRedeeming(false)
    }
  }

  // Update plans with current status
  const updatedPlans = plans.map((plan) => ({
    ...plan,
    current: plan.name.toLowerCase() === currentPlan,
  }))

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
        <h1 className="text-4xl font-bold text-white mb-4">Upgrade to Premium</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          Unlock powerful features and take your Discord server to the next level
        </p>
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
        {updatedPlans.map((plan) => (
          <div
            key={plan.name}
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

            {plan.current && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">Current Plan</span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-white">
                  {billingCycle === "yearly" && plan.price !== "$0"
                    ? `$${(Number.parseFloat(plan.price.slice(1)) * 12 * 0.8).toFixed(2)}`
                    : plan.price}
                </span>
                {plan.price !== "$0" && (
                  <span className="text-foreground ml-2">/{billingCycle === "yearly" ? "year" : plan.period}</span>
                )}
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
                  plan.current
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : plan.popular
                      ? "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white animate-glow"
                      : "bg-white/10 hover:bg-white/20 text-white"
                }
              `}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      {/* Redeem Code Section */}
      <div className="neumorphic rounded-2xl p-8 mb-12">
        <div className="flex items-center mb-6">
          <Gift className="w-6 h-6 text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Redeem Code</h2>
        </div>
        <p className="text-foreground mb-4">Have a premium redeem code? Enter it below to activate your plan.</p>
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
            disabled={isRedeeming || !redeemCode.trim()}
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
        {redeemMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center ${
              redeemMessage.type === "success"
                ? "bg-green-500/20 border border-green-500/30 text-green-200"
                : "bg-red-500/20 border border-red-500/30 text-red-200"
            }`}
          >
            {redeemMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <p className="text-sm">{redeemMessage.text}</p>
          </div>
        )}
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
