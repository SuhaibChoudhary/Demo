"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Save, Globe, Shield, MessageSquare, Volume2, Eye, Settings, ArrowLeft } from "lucide-react"
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

export default function GuildConfigPage() {
  const params = useParams()
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

  useEffect(() => {
    fetchGuildConfig()
  }, [params.id])

  const fetchGuildConfig = async () => {
    try {
      const response = await fetch(`/api/guilds/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setConfig(data.guild.config)
      }
    } catch (error) {
      console.error("Failed to fetch guild config:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/guilds/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      })

      if (response.ok) {
        // Show success notification
        console.log("Configuration saved successfully")
      }
    } catch (error) {
      console.error("Failed to save configuration:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-rose-200">Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link href="/dashboard/guilds">
          <Button variant="ghost" className="mr-4 p-2 text-rose-200 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Server Configuration</h1>
          <p className="text-rose-200">Customize your bot settings for this server</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-pink-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Basic Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-rose-200 mb-2">Command Prefix</label>
                <Input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                  className="neumorphic-inset bg-transparent border-0 text-white"
                  placeholder="!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rose-200 mb-2">Language</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value })}
                  className="w-full neumorphic-inset bg-transparent border-0 text-white rounded-lg p-3"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-pink-900">
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
              <Shield className="w-6 h-6 text-pink-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Moderation</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Auto Moderation</h3>
                  <p className="text-sm text-rose-200">Automatically moderate spam and inappropriate content</p>
                </div>
                <Switch
                  checked={config.automod}
                  onCheckedChange={(checked) => setConfig({ ...config, automod: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Moderation Logs</h3>
                  <p className="text-sm text-rose-200">Log moderation actions to a channel</p>
                </div>
                <Switch
                  checked={config.moderationLogs}
                  onCheckedChange={(checked) => setConfig({ ...config, moderationLogs: checked })}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="neumorphic rounded-2xl p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-pink-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Features</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Welcome Messages</h3>
                  <p className="text-sm text-rose-200">Send welcome messages to new members</p>
                </div>
                <Switch
                  checked={config.welcomeMessages}
                  onCheckedChange={(checked) => setConfig({ ...config, welcomeMessages: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Music Commands</h3>
                  <p className="text-sm text-rose-200">Enable music playback features</p>
                </div>
                <Switch
                  checked={config.musicEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, musicEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Activity Logging</h3>
                  <p className="text-sm text-rose-200">Log server activity and events</p>
                </div>
                <Switch
                  checked={config.logging}
                  onCheckedChange={(checked) => setConfig({ ...config, logging: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="neumorphic rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-pink-300/20 text-rose-200 hover:text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                View Server
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-pink-300/20 text-rose-200 hover:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Changes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-pink-300/20 text-rose-200 hover:text-white"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Commands
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 text-white py-3 rounded-xl animate-glow"
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
