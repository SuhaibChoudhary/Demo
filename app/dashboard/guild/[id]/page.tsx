"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Save,
  Globe,
  Shield,
  MessageSquare,
  Volume2,
  Eye,
  Settings,
  ArrowLeft,
  Lock,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface GuildConfig {
  prefix: string
  language: string
  automod: boolean
  logging: boolean
  welcomeMessages: boolean
  musicEnabled: boolean
  moderationLogs: boolean
}

interface GuildData {
  guildId: string
  name: string
  icon?: string
  premium: {
    active: boolean
    expiresAt?: string
  }
  config: GuildConfig
}

export default function GuildConfigPage() {
  const params = useParams()
  const [guildData, setGuildData] = useState<GuildData | null>(null)
  const [config, setConfig] = useState<GuildConfig>({
    prefix: "!",
    language: "en",
    automod: true,
    logging: true,
    welcomeMessages: false,
    musicEnabled: true,
    moderationLogs: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [canManage, setCanManage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userPremiumCount, setUserPremiumCount] = useState(0)
  const [isActivatingPremium, setIsActivatingPremium] = useState(false)
  const [premiumMessage, setPremiumMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchGuildAndUserPremium()
  }, [params.id])

  const fetchGuildAndUserPremium = async () => {
    setLoading(true)
    setErrorMessage(null)
    setPremiumMessage(null)
    try {
      const guildResponse = await fetch(`/api/guilds/${params.id}`)
      if (guildResponse.ok) {
        const guildData = await guildResponse.json()
        setGuildData(guildData.guild)
        setConfig(guildData.guild.config)
        setCanManage(guildData.canManage)
      } else {
        const errorData = await guildResponse.json()
        setErrorMessage(errorData.error || "Failed to load configuration.")
        setCanManage(false)
      }

      const userResponse = await fetch("/api/user")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserPremiumCount(userData.user.premium?.count || 0)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setErrorMessage("An error occurred while fetching data.")
      setCanManage(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/guilds/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      if (response.ok) {
        console.log("Configuration saved successfully")
        setErrorMessage(null)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Failed to save changes.")
      }
    } catch (error) {
      console.error("Failed to save configuration:", error)
      setErrorMessage("An error occurred while saving configuration.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivatePremium = async () => {
    setIsActivatingPremium(true)
    setPremiumMessage(null)
    try {
      const response = await fetch(`/api/guilds/${params.id}/activate-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPremiumMessage({ type: "success", text: data.message })
        setUserPremiumCount(data.newPremiumCount)
        // Update guildData to reflect new premium status
        setGuildData((prev) =>
          prev
            ? {
                ...prev,
                premium: { active: true, expiresAt: data.guildPremiumExpiresAt },
              }
            : null,
        )
      } else {
        const errorData = await response.json()
        setPremiumMessage({ type: "error", text: errorData.error || "Failed to activate premium." })
      }
    } catch (error) {
      console.error("Error activating premium:", error)
      setPremiumMessage({ type: "error", text: "An error occurred while activating premium." })
    } finally {
      setIsActivatingPremium(false)
    }
  }

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
  ]

  const isGuildPremiumActive =
    guildData?.premium?.active && guildData.premium.expiresAt && new Date(guildData.premium.expiresAt) > new Date()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/dashboard/guilds">
          <Button variant="ghost" className="mr-4 p-2 text-foreground hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Server Configuration</h1>
          <p className="text-foreground">Customize your bot settings for {guildData?.name || "this server"}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center">
          <Lock className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
          <p className="text-red-200 text-sm">{errorMessage}</p>
        </div>
      )}

      {!canManage && !errorMessage && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center">
          <Lock className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
          <p className="text-yellow-200 text-sm">
            You need "Manage Server" or "Administrator" permissions on Discord to change these settings.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Basic Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Command Prefix</label>
                <Input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                  className="neumorphic-inset bg-transparent border-0 text-white"
                  placeholder="!"
                  disabled={!canManage}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full neumorphic-inset bg-transparent border-0 text-white rounded-lg p-3 disabled:opacity-50"
                  disabled={!canManage}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-background">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Moderation Settings */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Moderation</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Auto Moderation</h3>
                  <p className="text-sm text-foreground">Automatically moderate spam and inappropriate content</p>
                </div>
                <Switch
                  checked={config.automod}
                  onCheckedChange={(checked) => setConfig({ ...config, automod: checked })}
                  disabled={!canManage}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Moderation Logs</h3>
                  <p className="text-sm text-foreground">Log moderation actions to a channel</p>
                </div>
                <Switch
                  checked={config.moderationLogs}
                  onCheckedChange={(checked) => setConfig({ ...config, moderationLogs: checked })}
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Features</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Welcome Messages</h3>
                  <p className="text-sm text-foreground">Send welcome messages to new members</p>
                </div>
                <Switch
                  checked={config.welcomeMessages}
                  onCheckedChange={(checked) => setConfig({ ...config, welcomeMessages: checked })}
                  disabled={!canManage}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Music Commands</h3>
                  <p className="text-sm text-foreground">Enable music playback features</p>
                </div>
                <Switch
                  checked={config.musicEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, musicEnabled: checked })}
                  disabled={!canManage}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Activity Logging</h3>
                  <p className="text-sm text-foreground">Log server activity and events</p>
                </div>
                <Switch
                  checked={config.logging}
                  onCheckedChange={(checked) => setConfig({ ...config, logging: checked })}
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Premium Activation */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Crown className="w-6 h-6 text-yellow-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Server Premium</h3>
            </div>
            {premiumMessage && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-center ${
                  premiumMessage.type === "success"
                    ? "bg-green-500/20 border border-green-500/30 text-green-200"
                    : "bg-red-500/20 border border-red-500/30 text-red-200"
                }`}
              >
                {premiumMessage.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <p className="text-sm">{premiumMessage.text}</p>
              </div>
            )}
            {isGuildPremiumActive ? (
              <>
                <p className="text-foreground mb-2">
                  This server is currently <span className="font-semibold text-white">Premium</span>.
                </p>
                {guildData?.premium.expiresAt && (
                  <p className="text-foreground text-sm mb-4">
                    Expires: {new Date(guildData.premium.expiresAt).toLocaleDateString()}
                  </p>
                )}
                <Button disabled className="w-full bg-gray-600 text-gray-300 cursor-not-allowed rounded-xl">
                  Premium Active
                </Button>
              </>
            ) : (
              <>
                <p className="text-foreground mb-4">
                  Activate premium features for this server. You have{" "}
                  <span className="font-semibold text-white">{userPremiumCount}</span> premium slots available.
                </p>
                <Button
                  onClick={handleActivatePremium}
                  disabled={!canManage || userPremiumCount <= 0 || isActivatingPremium}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium"
                >
                  {isActivatingPremium ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Activating...
                    </div>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 mr-2" />
                      Activate Premium
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="neumorphic rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary-300/20 text-foreground hover:text-white"
                disabled={!canManage}
              >
                <Globe className="w-4 h-4 mr-2" />
                View Server
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary-300/20 text-foreground hover:text-white"
                disabled={!canManage}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Changes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary-300/20 text-foreground hover:text-white"
                disabled={!canManage}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Commands
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !canManage}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl animate-glow"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Save Configuration
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
