"use client"

import { useState, useEffect } from "react"
import { User, Crown } from "lucide-react" // Import Crown icon

interface UserData {
  username: string
  avatar?: string
  premium: {
    count: number
    expiresAt?: string
  }
}

export function UserAvatar() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        console.error("Failed to fetch user data for avatar:", response.statusText)
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching user for avatar:", error)
      setUser(null)
    }
  }

  const isPremiumActive =
    user?.premium?.count &&
    user.premium.count > 0 &&
    user.premium.expiresAt &&
    new Date(user.premium.expiresAt) > new Date()

  if (!user) {
    return (
      <div className="w-8 h-8 neumorphic rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-primary-400" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <img
        src={user.avatar || "/placeholder.svg?height=32&width=32"}
        alt={user.username}
        className="w-8 h-8 rounded-full"
      />
      <div className="hidden md:block">
        <p className="text-sm font-medium text-white">{user.username}</p>
        <p className="text-xs text-foreground capitalize flex items-center">
          {isPremiumActive ? (
            <>
              <Crown className="w-3 h-3 mr-1 text-yellow-400" /> Premium
            </>
          ) : (
            "Free"
          )}
        </p>
      </div>
    </div>
  )
}
