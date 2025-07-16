"use client"

import { MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Guild } from "@/lib/models/Guild"

interface WelcomeSettingsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function WelcomeSettings({ config, setConfig, canManage }: WelcomeSettingsProps) {
  return (
    <div className="neumorphic rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-6 h-6 text-primary-400 mr-3" />
        <h2 className="text-xl font-semibold text-white">Welcome Messages</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Enable Welcome Messages</h3>
            <p className="text-sm text-foreground">Send a message when a new member joins</p>
          </div>
          <Switch
            checked={config.welcomeMessages}
            onCheckedChange={(checked) => setConfig({ ...config, welcomeMessages: checked })}
            disabled={!canManage}
          />
        </div>

        {config.welcomeMessages && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Welcome Channel (ID)</label>
              <Input
                type="text"
                value={config.welcomeChannelId || ""}
                onChange={(e) => setConfig({ ...config, welcomeChannelId: e.target.value })}
                className="neumorphic-inset bg-transparent border-0 text-white"
                placeholder="e.g., 123456789012345678"
                disabled={!canManage}
              />
              <p className="text-xs text-gray-400 mt-1">Enter the ID of the channel for welcome messages.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Custom Welcome Message</label>
              <Textarea
                value={config.welcomeMessage || ""}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="neumorphic-inset bg-transparent border-0 text-white"
                placeholder="Welcome {user} to {server}! Enjoy your stay."
                rows={4}
                disabled={!canManage}
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {"{user}"} for username, {"{server}"} for server name.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
