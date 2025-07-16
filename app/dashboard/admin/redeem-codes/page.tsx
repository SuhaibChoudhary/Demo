"use client"

import { useState, useEffect } from "react"
import { Gift, Copy, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay } from "@/components/error-display" // Import ErrorDisplay
import type { RedeemCode } from "@/lib/models/RedeemCode" // Import RedeemCode

export default function AdminRedeemCodeManagementPage() {
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // State for adding new codes
  const [newCodePremiumCount, setNewCodePremiumCount] = useState(1)
  const [newCodeExpiryDays, setNewCodeExpiryDays] = useState(30)
  const [newCodeQuantity, setNewCodeQuantity] = useState(1)
  const [isAddingCode, setIsAddingCode] = useState(false)

  useEffect(() => {
    fetchAllRedeemCodes()
  }, [])

  const fetchAllRedeemCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/redeem-codes/all")
      if (response.ok) {
        const data = await response.json()
        console.log("AdminRedeemCodeManagementPage: Fetched redeem codes:", data.codes) // Log fetched data
        setRedeemCodes(data.codes)
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to fetch redeem codes."
        console.error("AdminRedeemCodeManagementPage: Error fetching redeem codes:", errorMessage, errorData) // Log error
        setError(errorMessage)
      }
    } catch (err) {
      console.error("AdminRedeemCodeManagementPage: Unexpected error fetching redeem codes:", err) // Log unexpected error
      setError("An unexpected error occurred while fetching redeem codes.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Redeem code copied to clipboard.",
    })
  }

  const handleAddCode = async () => {
    setIsAddingCode(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/redeem-codes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          premiumCount: newCodePremiumCount,
          expiryDays: newCodeExpiryDays,
          quantity: newCodeQuantity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success!",
          description: data.message,
          variant: "default",
        })
        setNewCodePremiumCount(1)
        setNewCodeExpiryDays(30)
        setNewCodeQuantity(1)
        fetchAllRedeemCodes() // Refresh the list
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to add redeem codes."
        console.error("AdminRedeemCodeManagementPage: Error adding redeem codes:", errorMessage, errorData) // Log error
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("AdminRedeemCodeManagementPage: Unexpected error adding redeem codes:", err) // Log unexpected error
      setError("An unexpected error occurred while adding redeem codes.")
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding redeem codes.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCode(false)
    }
  }

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redeem code?")) {
      return
    }
    setError(null)
    try {
      const response = await fetch("/api/admin/redeem-codes/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Redeem code deleted successfully.",
          variant: "default",
        })
        fetchAllRedeemCodes() // Refresh the list
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to delete redeem code."
        console.error("AdminRedeemCodeManagementPage: Error deleting redeem code:", errorMessage, errorData) // Log error
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("AdminRedeemCodeManagementPage: Unexpected error deleting redeem code:", err) // Log unexpected error
      setError("An unexpected error occurred while deleting redeem code.")
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting redeem code.",
        variant: "destructive",
      })
    }
  }

  const filteredRedeemCodes = redeemCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.usedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading redeem codes...</p>
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
        <h1 className="text-3xl font-bold text-white mb-2">Redeem Code Management</h1>
        <p className="text-foreground">Generate, view, and manage premium redeem codes</p>
      </div>

      {/* Add New Redeem Code */}
      <div className="neumorphic rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Generate New Codes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Premium Slots per Code</label>
            <Input
              type="number"
              value={newCodePremiumCount}
              onChange={(e) => setNewCodePremiumCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
              min={1}
              className="neumorphic-inset bg-transparent border-0 text-white"
              disabled={isAddingCode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Expiry Days (optional)</label>
            <Input
              type="number"
              value={newCodeExpiryDays}
              onChange={(e) => setNewCodeExpiryDays(Math.max(0, Number.parseInt(e.target.value) || 0))}
              min={0}
              placeholder="0 for no expiry"
              className="neumorphic-inset bg-transparent border-0 text-white"
              disabled={isAddingCode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
            <Input
              type="number"
              value={newCodeQuantity}
              onChange={(e) => setNewCodeQuantity(Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1)))}
              min={1}
              max={100}
              className="neumorphic-inset bg-transparent border-0 text-white"
              disabled={isAddingCode}
            />
          </div>
        </div>
        <Button
          onClick={handleAddCode}
          disabled={isAddingCode}
          className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium"
        >
          {isAddingCode ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </div>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Generate Codes
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search codes, used by, or created by..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md neumorphic-inset bg-transparent border-0 text-white placeholder-foreground"
        />
      </div>

      {/* Redeem Codes List */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">All Redeem Codes ({filteredRedeemCodes.length})</h2>
        {filteredRedeemCodes.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-foreground">No redeem codes found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRedeemCodes.map((code) => {
              const isUsed = !!code.usedBy
              const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()
              return (
                <div key={code._id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div>
                      <p className="font-semibold text-white flex items-center">
                        {code.code}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0 text-foreground hover:text-white"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                          <span className="sr-only">Copy code</span>
                        </Button>
                      </p>
                      <p className="text-xs text-foreground">Slots: {code.premiumCount}</p>
                    </div>
                    <div className="text-xs text-foreground">
                      {isUsed ? (
                        <span className="inline-flex items-center text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" /> Used by {code.usedBy} on{" "}
                          {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : "N/A"}
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center text-red-400">
                          <XCircle className="w-3 h-3 mr-1" /> Expired on{" "}
                          {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : "N/A"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-yellow-400">
                          <Gift className="w-3 h-3 mr-1" /> Active{" "}
                          {code.expiresAt
                            ? `(Expires: ${new Date(code.expiresAt).toLocaleDateString()})`
                            : "(No Expiry)"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500"
                    onClick={() => handleDeleteCode(code._id)}
                    disabled={isAddingCode} // Disable delete while adding
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete code</span>
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
