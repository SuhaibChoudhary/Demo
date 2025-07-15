"use client"

import { useState } from "react"
import { User, Server, Crown, Calendar, Settings, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: "DiscordUser#1234",
    email: "user@example.com",
    joinDate: "2023-01-15",
    plan: "Gold",
    serversManaged: 12,
    totalMembers: 15420,
  })

  const stats = [
    {
      label: "Servers Managed",
      value: profile.serversManaged,
      icon: Server,
      color: "text-blue-400",
    },
    {
      label: "Total Members",
      value: profile.totalMembers.toLocaleString(),
      icon: User,
      color: "text-green-400",
    },
    {
      label: "Current Plan",
      value: profile.plan,
      icon: Crown,
      color: "text-yellow-400",
    },
    {
      label: "Member Since",
      value: new Date(profile.joinDate).toLocaleDateString(),
      icon: Calendar,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
        <p className="text-gray-400">Manage your account settings and view your statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="neumorphic rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 neumorphic rounded-full flex items-center justify-center mx-auto mb-4">
                <img src="/placeholder.svg?height=96&width=96" alt="Profile" className="w-20 h-20 rounded-full" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">{profile.username}</h2>
              <p className="text-gray-400 text-sm">{profile.email}</p>
              <div className="mt-3">
                <span
                  className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  ${profile.plan === "Gold" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}
                `}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {profile.plan} Plan
                </span>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
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
                    <p className="text-gray-400 text-sm">{stat.label}</p>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <Input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  disabled={!isEditing}
                  className="neumorphic-inset bg-transparent border-0 text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="neumorphic-inset bg-transparent border-0 text-white disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                  action: "Upgraded to Gold plan",
                  server: null,
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
                    {activity.server && <p className="text-gray-400 text-sm">{activity.server}</p>}
                  </div>
                  <span className="text-gray-500 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
