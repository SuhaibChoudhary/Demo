import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { NotificationsPanel } from "@/components/notifications-panel"
import { AuthGuard } from "@/components/auth-guard"
// Import SidebarProvider
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800">
          {" "}
          {/* Updated colors */}
          <div className="flex">
            <Sidebar />
            <main className="flex-1 lg:ml-0">
              <div className="flex justify-end p-4 lg:hidden">
                <NotificationsPanel />
              </div>
              <div className="hidden lg:flex justify-end p-4">
                <NotificationsPanel />
              </div>
              <div className="p-4 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
