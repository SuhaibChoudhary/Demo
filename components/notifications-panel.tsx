"use client"

import { useState } from "react"
import { Bell, X, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "./user-avatar"

const notifications = [
  {
    id: 1,
    type: "info",
    title: "New Feature Available",
    message: "Auto-moderation 2.0 is now live with improved detection.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Premium Activated",
    message: "Your Gold plan is now active. Enjoy premium features!",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Server Limit Reached",
    message: "You've reached the server limit for your current plan.",
    time: "3 days ago",
    read: true,
  },
]

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
}

const typeColors = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationList, setNotificationList] = useState(notifications)

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <>
      {/* Header with User Avatar and Notification Button */}
      <div className="flex items-center space-x-4">
        <UserAvatar />
        <Button onClick={() => setIsOpen(true)} className="relative neumorphic p-2" variant="ghost">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Panel Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />}

      {/* Notifications Panel */}
      <div
        className={`
        fixed top-0 right-0 h-full w-80 z-50 neumorphic border-l border-white/10
        transform ${isOpen ? "translate-x-0" : "translate-x-full"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="ghost" className="text-xs text-pink-400 hover:text-pink-300">
                  Mark all read
                </Button>
              )}
              <Button onClick={() => setIsOpen(false)} variant="ghost" className="p-1">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notificationList.map((notification) => {
              const Icon = typeIcons[notification.type as keyof typeof typeIcons]
              const colorClass = typeColors[notification.type as keyof typeof typeColors]

              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-all duration-200
                    ${notification.read ? "bg-white/5 opacity-60" : "neumorphic-inset hover:bg-white/10"}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-pink-500 rounded-full" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
