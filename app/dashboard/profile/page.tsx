"use client"

import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { Crown, Mail, Calendar, LogIn, Info, FileText, ShieldCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserData {
  discordId: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  premium: {
    count: number
    expiresAt?: string
  }
  createdAt: string
  lastLogin: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load user profile.")
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError("An unexpected error occurred while fetching your profile.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-200 mb-2">Error</h3>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  const isPremiumActive = user?.premium?.expiresAt && new Date(user.premium.expiresAt) > new Date()

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <UserAvatar
          src={user?.avatar}
          alt={user?.username}
          className="w-24 h-24 mx-auto mb-4 border-4 border-primary-500/50"
        />
        <h1 className="text-4xl font-bold text-white mb-2">
          {user?.username}
          <span className="text-foreground text-xl font-normal">#{user?.discriminator}</span>
        </h1>
        <p className="text-foreground text-lg">Your Personal Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Details */}
        <div className="neumorphic rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-white">{user?.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-foreground">Member Since</p>
                <p className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <LogIn className="w-5 h-5 text-primary-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-foreground">Last Login</p>
                <p className="text-white">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Status & Other Info */}
        <div className="space-y-6">
          <div className="neumorphic rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Premium Status</h2>
            <div className="flex items-center mb-4">
              <Crown className="w-6 h-6 text-yellow-400 mr-3" />
              <div>
                <p className="text-lg font-bold text-white">{isPremiumActive ? "Premium User" : "Free User"}</p>
                <p className="text-sm text-foreground">
                  Available Slots: <span className="font-semibold text-white">{user?.premium?.count || 0}</span>
                </p>
              </div>
            </div>
            {isPremiumActive && user?.premium?.expiresAt && (
              <p className="text-foreground text-sm mb-4">
                Expires:{" "}
                <span className="font-semibold text-white">
                  {new Date(user.premium.expiresAt).toLocaleDateString()}
                </span>
              </p>
            )}
            <Link href="/dashboard/premium">
              <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium">
                Manage Premium
              </Button>
            </Link>
          </div>

          {/* Legal Links */}
          <div className="neumorphic rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Legal & Info</h2>
            <div className="space-y-3">
              <Link
                href="/privacy-policy"
                className="flex items-center text-foreground hover:text-white transition-colors"
              >
                <ShieldCheck className="w-5 h-5 mr-3" />
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="flex items-center text-foreground hover:text-white transition-colors"
              >
                <FileText className="w-5 h-5 mr-3" />
                Terms of Service
              </Link>
              <Link href="/about" className="flex items-center text-foreground hover:text-white transition-colors">
                <Info className="w-5 h-5 mr-3" />
                About Noisy Bot
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
