"use client"

import { Volume2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Guild } from "@/lib/models/Guild"

interface MusicSettingsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function MusicSettings({ config, setConfig, canManage }: MusicSettingsProps) {
  return (
    <div className="neumorphic rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <Volume2 className="w-6 h-6 text-primary-400 mr-3" />
        <h2 className="text-xl font-semibold text-white">Music</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Enable Music Commands</h3>
            <p className="text-sm text-foreground">Allow users to play music in voice channels</p>
          </div>
          <Switch
            checked={config.musicEnabled}
            onCheckedChange={(checked) => setConfig({ ...config, musicEnabled: checked })}
            disabled={!canManage}
          />
        </div>
      </div>
    </div>
  )
}
