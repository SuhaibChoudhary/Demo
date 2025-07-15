"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Server, Users, Settings, Crown, ChevronRight } from "lucide-react"
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
  config: {
    prefix: string
    language: string
    automod: boolean
  }
}

export default function GuildsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuilds()
  }, [])

  const fetchGuilds = async () => {
    try {
      const response = await fetch("/api/guilds")
      if (response.ok) {
        const data = await response.json()
        setGuilds(data.guilds)
      }
    } catch (error) {
      console.error("Failed to fetch guilds:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGuilds = guilds.filter((guild) => guild.name.toLowerCase().includes(searchTerm.toLowerCase()))

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

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Servers</h1>
        <p className="text-foreground">Manage your Discord servers and bot settings</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search servers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Total Servers</p>
              <p className="text-2xl font-bold text-white">{guilds.length}</p>
            </div>
            <Server className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Total Members</p>
              <p className="text-2xl font-bold text-white">
                {guilds.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Premium Servers</p>
              <p className="text-2xl font-bold text-white">
                {guilds.filter((g) => g.premium.active && new Date(g.premium.expiresAt || 0) > new Date()).length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Guilds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuilds.map((guild) => (
          <div
            key={guild.guildId}
            className="neumorphic rounded-2xl p-6 hover:scale-105 transition-all duration-200 animate-slide-up"
          >
            <div className="flex items-center mb-4">
              <img
                src={guild.icon || "/placeholder.svg?height=48&width=48"}
                alt={guild.name}
                className="w-12 h-12 rounded-xl mr-4"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white truncate">{guild.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {guild.premium.active && new Date(guild.premium.expiresAt || 0) > new Date() && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400`}>Bot Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm text-foreground mb-4">
              <span>{guild.memberCount.toLocaleString()} members</span>
              <span>Prefix: {guild.config.prefix}</span>
            </div>

            <Link href={`/dashboard/guild/${guild.guildId}`}>
              <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                Configure
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {filteredGuilds.length === 0 && (
        <div className="text-center py-12">
          <Server className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No servers found</h3>
          <p className="text-foreground">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}
