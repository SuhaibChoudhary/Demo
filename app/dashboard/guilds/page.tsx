"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDiscordGuildIconUrl } from "@/lib/discord"
import { Crown, Settings, Bot, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Guild {
  guildId: string
  name: string
  icon?: string
  memberCount: number
  premium: {
    active: boolean
    expiresAt?: string
  }
  botAdded: boolean // Added botAdded status
  canManage: boolean
}

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchGuilds()
  }, [])

  const fetchGuilds = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/guilds")
      if (response.ok) {
        const data = await response.json()
        setGuilds(data.guilds)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch guilds.")
      }
    } catch (err) {
      console.error("Error fetching guilds:", err)
      setError("An unexpected error occurred while fetching guilds.")
    } finally {
      setLoading(false)
    }
  }

  const filteredGuilds = guilds.filter(
    (guild) => guild.name.toLowerCase().includes(searchTerm.toLowerCase()) || guild.guildId.includes(searchTerm),
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading your servers...</p>
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

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
        <p className="text-foreground">Manage bot settings for your Discord servers</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search servers by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
        />
      </div>

      {/* Guilds List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuilds.length === 0 ? (
          <div className="lg:col-span-3 text-center py-12 neumorphic rounded-2xl">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
            <p className="text-foreground max-w-md mx-auto">
              It looks like the bot is not in any of your managed servers. Please add the bot to your server to get
              started.
            </p>
            {/* TODO: Add bot invite link */}
            <Link href="#" className="mt-4 inline-block bg-primary-600 text-white py-2 px-4 rounded-xl font-medium">
              Add Bot to Server
            </Link>
          </div>
        ) : (
          filteredGuilds.map((guild) => (
            <div key={guild.guildId} className="neumorphic rounded-2xl p-6 flex flex-col items-center text-center">
              <img
                src={getDiscordGuildIconUrl(guild.guildId, guild.icon) || "/placeholder.svg"}
                alt={guild.name}
                className="w-20 h-20 rounded-full mb-4 shadow-lg"
              />
              <h2 className="text-xl font-bold text-white mb-2">{guild.name}</h2>
              <p className="text-sm text-foreground mb-4">ID: {guild.guildId}</p>

              <div className="flex items-center space-x-2 mb-4">
                {guild.premium.active ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                    Free Plan
                  </span>
                )}
                {guild.botAdded ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" /> Bot Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3 mr-1" /> Bot Inactive
                  </span>
                )}
              </div>

              <Link href={`/dashboard/guild/${guild.guildId}`} className="w-full">
                <Button
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium"
                  disabled={!guild.canManage}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Manage Settings
                </Button>
              </Link>
              {!guild.canManage && (
                <p className="text-xs text-red-300 mt-2">
                  You need "Manage Server" or "Administrator" permissions to manage this server.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
