"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WelcomeSettings } from "./guild-settings/welcome-settings"
import { LoggingSettings } from "./guild-settings/logging-settings"
import { ModerationSettings } from "./guild-settings/moderation-settings"
import { MusicSettings } from "./guild-settings/music-settings"
import { MiscSettings } from "./guild-settings/misc-settings"
import type { Guild } from "@/lib/models/Guild"
import { MessageSquare, Eye, Shield, Volume2, Settings } from "lucide-react"

interface GuildSettingsTabsProps {
  config: Guild["config"]
  setConfig: (config: Guild["config"]) => void
  canManage: boolean
}

export function GuildSettingsTabs({ config, setConfig, canManage }: GuildSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("welcome")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1 neumorphic rounded-xl mb-6">
        <TabsTrigger
          value="welcome"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:neumorphic-inset flex items-center justify-center py-2 px-4 rounded-lg text-foreground hover:text-white transition-colors"
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Welcome
        </TabsTrigger>
        <TabsTrigger
          value="logging"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:neumorphic-inset flex items-center justify-center py-2 px-4 rounded-lg text-foreground hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" /> Logging
        </TabsTrigger>
        <TabsTrigger
          value="moderation"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:neumorphic-inset flex items-center justify-center py-2 px-4 rounded-lg text-foreground hover:text-white transition-colors"
        >
          <Shield className="w-4 h-4 mr-2" /> Moderation
        </TabsTrigger>
        <TabsTrigger
          value="music"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:neumorphic-inset flex items-center justify-center py-2 px-4 rounded-lg text-foreground hover:text-white transition-colors"
        >
          <Volume2 className="w-4 h-4 mr-2" /> Music
        </TabsTrigger>
        <TabsTrigger
          value="misc"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:neumorphic-inset flex items-center justify-center py-2 px-4 rounded-lg text-foreground hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" /> Misc.
        </TabsTrigger>
      </TabsList>

      <TabsContent value="welcome">
        <WelcomeSettings config={config} setConfig={setConfig} canManage={canManage} />
      </TabsContent>
      <TabsContent value="logging">
        <LoggingSettings config={config} setConfig={setConfig} canManage={canManage} />
      </TabsContent>
      <TabsContent value="moderation">
        <ModerationSettings config={config} setConfig={setConfig} canManage={canManage} />
      </TabsContent>
      <TabsContent value="music">
        <MusicSettings config={config} setConfig={setConfig} canManage={canManage} />
      </TabsContent>
      <TabsContent value="misc">
        <MiscSettings config={config} setConfig={setConfig} canManage={canManage} />
      </TabsContent>
    </Tabs>
  )
}
