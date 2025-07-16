"use client"

import { useState, useEffect } from "react"
import { getDiscordGuildIconUrl } from "@/lib/discord"
import { Crown, Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay } from "@/components/error-display"

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

  // State for premium edit modal
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [selectedGuild, setSelectedGuild] = useState<AdminGuild | null>(null)
  const [editPremiumActive, setEditPremiumActive] = useState(false)
  const [editExpiryDays, setEditExpiryDays] = useState<number | undefined>(undefined)
  const [isUpdatingPremium, setIsUpdatingPremium] = useState(false)

  useEffect(() => {
    fetchAllGuilds()
  }, [])

  const fetchAllGuilds = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/guilds/all")
      if (response.ok) {
        const data = await response.json()
        setGuilds(data.guilds)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to fetch guild data."
        setError(errorMessage)
      }
    } catch (err) {
      console.error("AdminGuildManagementPage: Unexpected error fetching guilds:", err)
      setError("An unexpected error occurred while fetching guilds.")
    } finally {
      setLoading(false)
    }
  }

  const openPremiumModal = (guild: AdminGuild) => {
    setSelectedGuild(guild)
    setEditPremiumActive(guild.premium?.active || false)
    if (guild.premium?.expiresAt) {
      const expiryDate = new Date(guild.premium.expiresAt)
      const now = new Date()
      const diffTime = expiryDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setEditExpiryDays(Math.max(0, diffDays)) // Ensure it's not negative
    } else {
      setEditExpiryDays(0) // No expiry
    }
    setIsPremiumModalOpen(true)
  }

  const handleUpdatePremium = async () => {
    if (!selectedGuild) return

    setIsUpdatingPremium(true)
    try {
      const response = await fetch(`/api/admin/guilds/${selectedGuild.guildId}/update-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: editPremiumActive,
          expiryDays: editExpiryDays,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success!",
          description: data.message,
          variant: "default",
        })
        fetchAllGuilds() // Refresh the list
        setIsPremiumModalOpen(false)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to update premium."
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error updating guild premium:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating premium.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPremium(false)
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
        <ErrorDisplay message={error} />
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
                    <Button variant="ghost" size="sm" onClick={() => openPremiumModal(guild)}>
                      <Settings className="w-4 h-4" />
                      <span className="sr-only">Edit Premium</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Premium Edit Modal */}
      <Dialog open={isPremiumModalOpen} onOpenChange={setIsPremiumModalOpen}>
        <DialogContent className="neumorphic p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl mb-2">Edit Premium for {selectedGuild?.name}</DialogTitle>
            <p className="text-foreground text-sm">Adjust premium status and expiry for this guild.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="premiumActive" className="text-foreground">
                Premium Active
              </Label>
              <Switch
                id="premiumActive"
                checked={editPremiumActive}
                onCheckedChange={setEditPremiumActive}
                disabled={isUpdatingPremium}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDays" className="text-right text-foreground">
                Expiry (Days)
              </Label>
              <Input
                id="expiryDays"
                type="number"
                value={editExpiryDays}
                onChange={(e) => setEditExpiryDays(Math.max(0, Number(e.target.value)))}
                className="col-span-3 neumorphic-inset bg-transparent border-0 text-white"
                min={0}
                placeholder="0 for no expiry"
                disabled={isUpdatingPremium || !editPremiumActive}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">
              Set to 0 days for no expiry. Current expiry:{" "}
              {selectedGuild?.premium?.expiresAt
                ? new Date(selectedGuild.premium.expiresAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <Button
              onClick={handleUpdatePremium}
              disabled={isUpdatingPremium}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white"
            >
              {isUpdatingPremium ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                "Update Premium"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
