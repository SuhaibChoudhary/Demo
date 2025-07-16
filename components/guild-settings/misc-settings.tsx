"use client"

import { Youtube, Gift, Settings, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Guild } from "@/lib/models/Guild"

interface MiscSettingsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function MiscSettings({ config, setConfig, canManage }: MiscSettingsProps) {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
  ]

  return (
    <div className="neumorphic rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-primary-400 mr-3" />
        <h2 className="text-xl font-semibold text-white">Miscellaneous Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
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

        {/* YouTube Integration */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white flex items-center">
                <Youtube className="w-5 h-5 mr-2 text-red-500" /> YouTube Integration
              </h3>
              <p className="text-sm text-foreground">Enable commands for YouTube video playback and search</p>
            </div>
            <Switch
              checked={config.youtubeEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, youtubeEnabled: checked })}
              disabled={!canManage}
            />
          </div>
        </div>

        {/* Giveaway Feature */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white flex items-center">
                <Gift className="w-5 h-5 mr-2 text-pink-400" /> Giveaway Feature
              </h3>
              <p className="text-sm text-foreground">Allow creation and management of giveaways</p>
            </div>
            <Switch
              checked={config.giveawayEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, giveawayEnabled: checked })}
              disabled={!canManage}
            />
          </div>
        </div>

        {/* Auto-Role Feature */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" /> Auto-Role on Join
              </h3>
              <p className="text-sm text-foreground">Automatically assign a role to new members</p>
            </div>
            <Switch
              checked={config.autoRoleEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, autoRoleEnabled: checked })}
              disabled={!canManage}
            />
          </div>
          {config.autoRoleEnabled && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Auto-Role ID</label>
              <Input
                type="text"
                value={config.autoRoleId || ""}
                onChange={(e) => setConfig({ ...config, autoRoleId: e.target.value })}
                className="neumorphic-inset bg-transparent border-0 text-white"
                placeholder="e.g., 123456789012345678"
                disabled={!canManage}
              />
              <p className="text-xs text-gray-400 mt-1">Enter the ID of the role to assign automatically.</p>
            </div>
          )}
        </div>

        {/* Announcement Channel */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Announcement Channel (ID)</label>
            <Input
              type="text"
              value={config.announcementChannelId || ""}
              onChange={(e) => setConfig({ ...config, announcementChannelId: e.target.value })}
              className="neumorphic-inset bg-transparent border-0 text-white"
              placeholder="e.g., 123456789012345678"
              disabled={!canManage}
            />
            <p className="text-xs text-gray-400 mt-1">Channel for general bot announcements.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
