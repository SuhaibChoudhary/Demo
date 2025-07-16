"use client"

import { useState, useEffect } from "react"
import { Users, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ErrorDisplay } from "@/components/error-display" // Import ErrorDisplay
import { getDiscordAvatarUrl } from "@/lib/discord" // Import avatar helper

interface AdminUser {
  discordId: string
  username: string
  avatar?: string
  premium: {
    count: number
    expiresAt?: string
  }
  createdAt: string
  lastLogin: string
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/users/all")
      if (response.ok) {
        const data = await response.json()
        console.log("AdminUserManagementPage: Fetched users:", data.users) // Log fetched data
        setUsers(data.users)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to fetch user data."
        console.error("AdminUserManagementPage: Error fetching users:", errorMessage, errorData) // Log error
        setError(errorMessage)
      }
    } catch (err) {
      console.error("AdminUserManagementPage: Unexpected error fetching users:", err) // Log unexpected error
      setError("An unexpected error occurred while fetching users.")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.discordId.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <ErrorDisplay message={error} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-foreground">View and manage all registered users</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search users by username or Discord ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
        />
      </div>

      {/* Users List */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">All Users ({filteredUsers.length})</h2>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-foreground">No users found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const isPremiumActive =
                user.premium?.count > 0 && user.premium?.expiresAt && new Date(user.premium.expiresAt) > new Date()
              return (
                <div key={user.discordId} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getDiscordAvatarUrl(user.discordId, user.avatar) || "/placeholder.svg?height=40&width=40"}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-foreground">ID: {user.discordId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span
                        className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                          ${isPremiumActive ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}
                        `}
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        {isPremiumActive ? `Premium (${user.premium.count} slots)` : "Free Plan"}
                      </span>
                      {isPremiumActive && user.premium.expiresAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Expires: {new Date(user.premium.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {/* Future actions like Edit/Delete User */}
                    {/* <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button> */}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
