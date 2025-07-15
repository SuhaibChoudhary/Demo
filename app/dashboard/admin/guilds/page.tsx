"use client"

import { useState, useEffect } from "react"
import { getDiscordGuildIconUrl } from "@/lib/discord"
import { Crown, XCircle, ShieldOff, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AdminGuild {
  _id: string
  guildId: string
  name: string
  icon?: string
  ownerId: string
  botAdded: boolean
  premium: {
    active: boolean
    expiresAt?: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminGuildManagementPage() {
  const [guilds, setGuilds] = useState<AdminGuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchAllGuilds()
  }, [])

  const fetchAllGuilds = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/guilds/all") // Assuming this API exists or will be created
      if (response.ok) {
        const data = await response.json()
        setGuilds(data.guilds)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch guild data.")
      }
    } catch (err) {
      console.error("Error fetching guilds:", err)
      setError("An unexpected error occurred while fetching guilds.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePremium = async (guildId: string) => {
    if (
      !confirm(
        `Are you sure you want to remove premium from guild "${guilds.find((g) => g.guildId === guildId)?.name}"?`,
      )
    ) {
      return
    }
    try {
      const response = await fetch(`/api/admin/guilds/${guildId}/remove-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Premium removed from guild.",
          variant: "default",
        })
        fetchAllGuilds() // Refresh the list
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to remove premium.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error removing premium:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing premium.",
        variant: "destructive",
      })
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
          <p className="text-foreground">Loading guild data...</p>
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
        <h1 className="text-3xl font-bold text-white mb-2">Guild Management</h1>
        <p className="text-foreground">View and manage all registered guilds</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search guilds by name or Discord ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
        />
      </div>

      {/* Guilds List */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">All Guilds ({filteredGuilds.length})</h2>
        {filteredGuilds.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-foreground">No guilds found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGuilds.map((guild) => {
              const isPremiumActive =
                guild.premium?.active && guild.premium?.expiresAt && new Date(guild.premium.expiresAt) > new Date()
              return (
                <div key={guild.guildId} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getDiscordGuildIconUrl(guild.guildId, guild.icon) || "/placeholder.svg"}
                      alt={guild.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-white">{guild.name}</p>
                      <p className="text-xs text-foreground">ID: {guild.guildId}</p>
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
                        {isPremiumActive ? "Premium" : "Free Plan"}
                      </span>
                      {isPremiumActive && guild.premium.expiresAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Expires: {new Date(guild.premium.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {isPremiumActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => handleRemovePremium(guild.guildId)}
                      >
                        <ShieldOff className="w-4 h-4" />
                        <span className="sr-only">Remove Premium</span>
                      </Button>
                    )}
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
