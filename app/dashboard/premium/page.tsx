"use client"

import { useState, useEffect } from "react"
import { Crown, Check, Zap, Star, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    fetchPremiumStatus()
  }, [])

  const fetchPremiumStatus = async () => {
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

  // Update plans with current status
  const updatedPlans = plans.map((plan) => ({
    ...plan,
    current: plan.name.toLowerCase() === currentPlan,
  }))

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 neumorphic rounded-2xl mb-4">
          <Crown className="w-8 h-8 text-pink-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Upgrade to Premium</h1>
        <p className="text-xl text-rose-200 max-w-2xl mx-auto">
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
                ? "bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white"
                : "text-rose-200 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2 rounded-lg transition-all duration-200 ${
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white"
                : "text-rose-200 hover:text-white"
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
              ${plan.popular ? "ring-2 ring-pink-500 scale-105" : ""}
              hover:scale-105
            `}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white px-4 py-1 rounded-full text-sm font-medium">
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
                  <span className="text-rose-200 ml-2">/{billingCycle === "yearly" ? "year" : plan.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-rose-200">{feature}</span>
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
                      ? "bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 text-white animate-glow"
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

      {/* Features Comparison */}
      <div className="neumorphic rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Choose Premium?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-rose-200">Premium servers get priority processing for faster response times</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
            <p className="text-rose-200">AI-powered moderation and advanced security features</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 neumorphic rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium Support</h3>
            <p className="text-rose-200">Get priority support from our dedicated team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
