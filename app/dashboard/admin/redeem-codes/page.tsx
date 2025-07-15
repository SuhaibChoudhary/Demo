"use client"

import { useState, useEffect } from "react"
import { Gift, PlusCircle, Copy, CheckCircle, XCircle, Clock } from "lucide-react" // Added Clock, User icons
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GeneratedCode } from "@/lib/models/GeneratedCode" // Import GeneratedCode
import type { RedeemCode } from "@/lib/models/RedeemCode" // Import RedeemCode

export default function GenerateRedeemCodesPage() {
  const [numCodes, setNumCodes] = useState(1)
  const [premiumCount, setPremiumCount] = useState(1)
  const [expiryDays, setExpiryDays] = useState<number | undefined>(undefined)
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([])
  const [allRedeemCodes, setAllRedeemCodes] = useState<RedeemCode[]>([]) // State for all redeem codes
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingCodes, setIsLoadingCodes] = useState(true) // Loading state for fetching all codes
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchAllRedeemCodes()
  }, [])

  const fetchAllRedeemCodes = async () => {
    setIsLoadingCodes(true)
    try {
      const response = await fetch("/api/admin/redeem-codes/all")
      if (response.ok) {
        const data = await response.json()
        setAllRedeemCodes(data.codes)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "Failed to fetch all redeem codes." })
      }
    } catch (error) {
      console.error("Error fetching all redeem codes:", error)
      setMessage({ type: "error", text: "An unexpected error occurred while fetching codes." })
    } finally {
      setIsLoadingCodes(false)
    }
  }

  const handleGenerateCodes = async () => {
    setIsGenerating(true)
    setMessage(null)
    setGeneratedCodes([])

    try {
      const response = await fetch("/api/admin/generate-redeem-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numCodes,
          premiumCount,
          expiryDays,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCodes(data.codes)
        setMessage({ type: "success", text: `Successfully generated ${data.codes.length} codes.` })
        fetchAllRedeemCodes() // Refresh the list of all codes
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "Failed to generate codes." })
      }
    } catch (error) {
      console.error("Error generating codes:", error)
      setMessage({ type: "error", text: "An error occurred while generating codes." })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Optionally, show a small visual feedback
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Redeem Code Management</h1>
        <p className="text-foreground">Generate and manage premium redeem codes</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center ${
            message.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-200"
              : "bg-red-500/20 border border-red-500/30 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Code Generation Section */}
      <div className="neumorphic rounded-2xl p-6 mb-8">
        <div className="flex items-center mb-6">
          <Gift className="w-6 h-6 text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Generate New Codes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="numCodes" className="block text-sm font-medium text-foreground mb-2">
              Number of Codes
            </label>
            <Input
              id="numCodes"
              type="number"
              min="1"
              value={numCodes}
              onChange={(e) => setNumCodes(Number(e.target.value))}
              className="neumorphic-inset bg-transparent border-0 text-white"
              disabled={isGenerating}
            />
          </div>

          <div>
            <label htmlFor="premiumCount" className="block text-sm font-medium text-foreground mb-2">
              Premium Slots Granted
            </label>
            <select
              id="premiumCount"
              value={premiumCount}
              onChange={(e) => setPremiumCount(Number(e.target.value))}
              className="w-full neumorphic-inset bg-transparent border-0 text-white rounded-lg p-3 disabled:opacity-50"
              disabled={isGenerating}
            >
              <option value={1} className="bg-background">
                1 Premium Slot
              </option>
              <option value={2} className="bg-background">
                2 Premium Slots
              </option>
              <option value={4} className="bg-background">
                4 Premium Slots
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="expiryDays" className="block text-sm font-medium text-foreground mb-2">
              Expiry (Days, optional)
            </label>
            <Input
              id="expiryDays"
              type="number"
              min="1"
              placeholder="e.g., 30 for 30 days"
              value={expiryDays || ""}
              onChange={(e) => setExpiryDays(e.target.value ? Number(e.target.value) : undefined)}
              className="neumorphic-inset bg-transparent border-0 text-white"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry.</p>
          </div>
        </div>

        <Button
          onClick={handleGenerateCodes}
          disabled={isGenerating || numCodes < 1}
          className="mt-8 w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generating...
            </div>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 mr-2" />
              Generate Codes
            </>
          )}
        </Button>
      </div>

      {generatedCodes.length > 0 && (
        <div className="neumorphic rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Recently Generated Codes</h2>
          <div className="space-y-4">
            {generatedCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-white text-sm break-all">{code.code}</p>
                  <p className="text-xs text-foreground mt-1">
                    Slots: {code.premiumCount}
                    {code.expiresAt && ` | Expires: ${new Date(code.expiresAt).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(code.code)}
                  className="ml-4 text-foreground hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Redeem Codes List */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">All Redeem Codes</h2>
        {isLoadingCodes ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-foreground">Loading all codes...</p>
          </div>
        ) : allRedeemCodes.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-foreground">No redeem codes found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allRedeemCodes.map((code) => (
              <div key={code.code} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-white text-sm break-all">{code.code}</p>
                  <div className="text-xs text-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Slots: {code.premiumCount}</span>
                    {code.expiresAt && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Expires: {new Date(code.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    {code.usedBy ? (
                      <span className="flex items-center text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" /> Used by: {code.usedBy}
                        {code.usedAt && ` on ${new Date(code.usedAt).toLocaleDateString()}`}
                      </span>
                    ) : (
                      <span className="flex items-center text-red-400">
                        <XCircle className="w-3 h-3 mr-1" /> Unused
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(code.code)}
                  className="ml-4 text-foreground hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
