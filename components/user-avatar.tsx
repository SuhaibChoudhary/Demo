"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"

interface UserData {
  username: string
  avatar?: string
  premiumStatus: string
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
        // Handle cases where user data fetch fails (e.g., not authenticated)
        console.error("Failed to fetch user data for avatar:", response.statusText)
        setUser(null) // Ensure user is null if fetch fails
      }
    } catch (error) {
      console.error("Error fetching user for avatar:", error)
      setUser(null) // Ensure user is null on network/other errors
    }
  }

  if (!user) {
    return (
      <div className="w-8 h-8 neumorphic rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-pink-400" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <img
        src={user.avatar || "/placeholder.svg?height=32&width=32"} // Use Discord avatar or placeholder
        alt={user.username}
        className="w-8 h-8 rounded-full"
      />
      <div className="hidden md:block">
        <p className="text-sm font-medium text-white">{user.username}</p>
        <p className="text-xs text-rose-200 capitalize">{user.premiumStatus}</p>
      </div>
    </div>
  )
}
