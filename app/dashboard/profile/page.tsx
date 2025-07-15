"use client"

import { useState, useEffect } from "react"
import { User, Server, Crown, Calendar, Settings, Edit3, Save, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserProfile {
  username: string
  email: string
  joinDate: string
  premiumCount: number // Changed from plan
  premiumExpiresAt?: string // New field
  serversManaged: number
  totalMembers: number
  avatar?: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    joinDate: "",
    premiumCount: 0,
    premiumExpiresAt: undefined,
    serversManaged: 0,
    totalMembers: 0,
    avatar: "/placeholder.svg?height=96&width=96",
  })
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        const fetchedProfile: UserProfile = {
          username: data.user.username,
          email: data.user.email,
          joinDate: data.user.createdAt,
          premiumCount: data.user.premium?.count || 0, // Access premium.count
          premiumExpiresAt: data.user.premium?.expiresAt, // Access premium.expiresAt
          serversManaged: data.stats.totalGuilds,
          totalMembers: data.stats.totalMembers,
          avatar: data.user.avatar || "/placeholder.svg?height=96&width=96",
        }
        setProfile(fetchedProfile)
        setOriginalProfile(fetchedProfile)
      } else {
        console.error("Failed to fetch user profile:", response.statusText)
        setSaveMessage({ type: "error", text: "Failed to load profile data." })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setSaveMessage({ type: "error", text: "An error occurred while loading profile." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: profile.username,
          email: profile.email,
        }),
      })

      if (response.ok) {
        setSaveMessage({ type: "success", text: "Profile updated successfully!" })
        setIsEditing(false)
        setOriginalProfile(profile)
      } else {
        const errorData = await response.json()
        setSaveMessage({ type: "error", text: errorData.error || "Failed to save changes." })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveMessage({ type: "error", text: "An error occurred while saving profile." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfile(originalProfile)
    }
    setIsEditing(false)
    setSaveMessage(null)
  }

  const stats = [
    {
      label: "Servers Managed",
      value: profile.serversManaged,
      icon: Server,
      color: "text-primary-400",
    },
    {
      label: "Total Members",
      value: profile.totalMembers.toLocaleString(),
      icon: User,
      color: "text-primary-400",
    },
    {
      label: "Premium Slots",
      value: profile.premiumCount,
      icon: Crown,
      color: "text-yellow-400",
    },
    {
      label: "Member Since",
      value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "N/A",
      icon: Calendar,
      color: "text-primary-400",
    },
  ]

  const isPremiumActive =
    profile.premiumCount > 0 && profile.premiumExpiresAt && new Date(profile.premiumExpiresAt) > new Date()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
        <p className="text-foreground">Manage your account settings and view your statistics</p>
      </div>

      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center ${
            saveMessage.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-200"
              : "bg-red-500/20 border border-red-500/30 text-red-200"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          )}
          <p className="text-sm">{saveMessage.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="neumorphic rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 neumorphic rounded-full flex items-center justify-center mx-auto mb-4">
                <img src={profile.avatar || "/placeholder.svg"} alt="Profile" className="w-20 h-20 rounded-full" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">{profile.username}</h2>
              <p className="text-foreground text-sm">{profile.email}</p>
              <div className="mt-3">
                <span
                  className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  ${isPremiumActive ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}
                `}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {isPremiumActive ? "Premium Active" : "Free Plan"}
                </span>
                {isPremiumActive && profile.premiumExpiresAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Expires: {new Date(profile.premiumExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="neumorphic rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Account Settings */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-primary-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Account Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  disabled={!isEditing}
                  className="neumorphic-inset bg-transparent border-0 text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="neumorphic-inset bg-transparent border-0 text-white disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="neumorphic rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>

            <div className="space-y-4">
              {[
                {
                  action: "Updated server configuration",
                  server: "Awesome Gaming Server",
                  time: "2 hours ago",
                },
                {
                  action: "Activated premium for Dev Community", // Example activity
                  server: "Dev Community",
                  time: "1 day ago",
                },
                {
                  action: "Added new server",
                  server: "Dev Community",
                  time: "3 days ago",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0"
                >
                  <div>
                    <p className="text-white font-medium">{activity.action}</p>
                    {activity.server && <p className="text-foreground text-sm">{activity.server}</p>}
                  </div>
                  <span className="text-foreground text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
