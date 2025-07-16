"use client"

import { useState, useEffect } from "react"
import { Users, Crown, Settings, Gift } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay } from "@/components/error-display"
import { getDiscordAvatarUrl } from "@/lib/discord"

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
  const { toast } = useToast()

  // State for premium edit modal
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editPremiumCount, setEditPremiumCount] = useState(0)
  const [editExpiryDays, setEditExpiryDays] = useState<number | undefined>(undefined)
  const [isUpdatingPremium, setIsUpdatingPremium] = useState(false)

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
        setUsers(data.users)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to fetch user data."
        setError(errorMessage)
      }
    } catch (err) {
      console.error("AdminUserManagementPage: Unexpected error fetching users:", err)
      setError("An unexpected error occurred while fetching users.")
    } finally {
      setLoading(false)
    }
  }

  const openPremiumModal = (user: AdminUser) => {
    setSelectedUser(user)
    setEditPremiumCount(user.premium?.count || 0)
    if (user.premium?.expiresAt) {
      const expiryDate = new Date(user.premium.expiresAt)
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
    if (!selectedUser) return

    setIsUpdatingPremium(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.discordId}/update-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          premiumCount: editPremiumCount,
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
        fetchAllUsers() // Refresh the list
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
      console.error("Error updating user premium:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating premium.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPremium(false)
    }
  }

  const handleRemovePremium = () => {
    setEditPremiumCount(0)
    setEditExpiryDays(0) // Set expiry to 0 days (effectively no expiry, but count is 0)
    // The update function will handle the actual API call
    handleUpdatePremium()
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
                    <Button variant="ghost" size="sm" onClick={() => openPremiumModal(user)}>
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
            <DialogTitle className="text-white text-2xl mb-2">Edit Premium for {selectedUser?.username}</DialogTitle>
            <p className="text-foreground text-sm">Adjust premium slots and expiry for this user.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="premiumCount" className="text-right text-foreground">
                Slots
              </Label>
              <Input
                id="premiumCount"
                type="number"
                value={editPremiumCount}
                onChange={(e) => setEditPremiumCount(Math.max(0, Number(e.target.value)))}
                className="col-span-3 neumorphic-inset bg-transparent border-0 text-white"
                min={0}
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
                disabled={isUpdatingPremium}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">
              Set to 0 days for no expiry. Current expiry:{" "}
              {selectedUser?.premium?.expiresAt ? new Date(selectedUser.premium.expiresAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleRemovePremium}
              disabled={isUpdatingPremium || (selectedUser?.premium?.count || 0) === 0}
              className="w-full sm:w-auto"
            >
              <Gift className="w-4 h-4 mr-2" />
              Remove Premium
            </Button>
            <Button
              onClick={handleUpdatePremium}
              disabled={isUpdatingPremium}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white"
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
