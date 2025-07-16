"use client"

import { Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { Guild } from "@/lib/models/Guild"

interface LoggingSettingsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function LoggingSettings({ config, setConfig, canManage }: LoggingSettingsProps) {
  return (
    <div className="neumorphic rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <Eye className="w-6 h-6 text-primary-400 mr-3" />
        <h2 className="text-xl font-semibold text-white">Logging</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Enable Activity Logging</h3>
            <p className="text-sm text-foreground">Log server activity and events to a channel</p>
          </div>
          <Switch
            checked={config.logging}
            onCheckedChange={(checked) => setConfig({ ...config, logging: checked })}
            disabled={!canManage}
          />
        </div>

        {config.logging && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Log Channel (ID)</label>
            <Input
              type="text"
              value={config.logChannelId || ""}
              onChange={(e) => setConfig({ ...config, logChannelId: e.target.value })}
              className="neumorphic-inset bg-transparent border-0 text-white"
              placeholder="e.g., 123456789012345678"
              disabled={!canManage}
            />
            <p className="text-xs text-gray-400 mt-1">Enter the ID of the channel where logs will be sent.</p>
          </div>
        )}
      </div>
    </div>
  )
}
