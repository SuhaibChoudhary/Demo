"use client"

import { Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Guild } from "@/lib/models/Guild"

interface ModerationSettingsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function ModerationSettings({ config, setConfig, canManage }: ModerationSettingsProps) {
  return (
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

        {config.moderationLogs && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Moderation Log Channel (ID)</label>
            <Input
              type="text"
              value={config.moderationChannelId || ""}
              onChange={(e) => setConfig({ ...config, moderationChannelId: e.target.value })}
              className="neumorphic-inset bg-transparent border-0 text-white"
              placeholder="e.g., 123456789012345678"
              disabled={!canManage}
            />
            <p className="text-xs text-gray-400 mt-1">Enter the ID of the channel for moderation logs.</p>
          </div>
        )}
      </div>
    </div>
  )
}
