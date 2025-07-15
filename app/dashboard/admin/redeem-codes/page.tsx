"use client"

import { useState } from "react"
import { Gift, PlusCircle, Copy, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GeneratedCode } from "@/lib/models/GeneratedCode" // Import GeneratedCode

export default function GenerateRedeemCodesPage() {
  const [numCodes, setNumCodes] = useState(1)
  const [premiumCount, setPremiumCount] = useState(1) // Changed from plan
  const [expiryDays, setExpiryDays] = useState<number | undefined>(undefined)
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
          premiumCount, // Use premiumCount
          expiryDays,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCodes(data.codes)
        setMessage({ type: "success", text: `Successfully generated ${data.codes.length} codes.` })
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
        <h1 className="text-3xl font-bold text-white mb-2">Generate Redeem Codes</h1>
        <p className="text-foreground">Create new premium redeem codes for users</p>
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

      <div className="neumorphic rounded-2xl p-6 mb-8">
        <div className="flex items-center mb-6">
          <Gift className="w-6 h-6 text-primary-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Code Generation Settings</h2>
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
        <div className="neumorphic rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Generated Codes</h2>
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
    </div>
  )
}
