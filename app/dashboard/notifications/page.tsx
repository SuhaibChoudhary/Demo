"use client"

import { useState } from "react"
import { Bell, Info, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const notifications = [
  {
    id: 1,
    type: "info",
    title: "New Feature Available",
    message: "Auto-moderation 2.0 is now live with improved detection algorithms and better accuracy.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Premium Activated",
    message:
      "Your premium slots are now active. Enjoy premium features including advanced moderation and priority support!",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Server Limit Reached",
    message: "You've reached the server limit for your current plan. Upgrade to manage more servers.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "Maintenance Scheduled",
    message: "Scheduled maintenance will occur on Sunday, 2:00 AM UTC. Expected downtime: 30 minutes.",
    time: "5 days ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    title: "Server Added Successfully",
    message: 'Your bot has been successfully added to "Dev Community" server.',
    time: "1 week ago",
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

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated with the latest changes and updates</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="bg-primary-600 hover:bg-primary-700 text-white">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Notifications</p>
              <p className="text-2xl font-bold text-white">{notificationList.length}</p>
            </div>
            <Bell className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Read</p>
              <p className="text-2xl font-bold text-white">{notificationList.length - unreadCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notificationList.map((notification) => {
          const Icon = typeIcons[notification.type as keyof typeof typeIcons]
          const colorClass = typeColors[notification.type as keyof typeof typeColors]

          return (
            <div
              key={notification.id}
              className={`
                neumorphic rounded-2xl p-6 transition-all duration-200 animate-slide-up
                ${notification.read ? "opacity-60" : "hover:scale-[1.02]"}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-xl neumorphic-inset ${!notification.read ? "animate-pulse" : ""}`}>
                    <Icon className={`w-5 h-5 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">{notification.title}</h3>
                      {!notification.read && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                    </div>
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">{notification.message}</p>
                    <p className="text-gray-500 text-xs">{notification.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      className="text-primary-400 hover:text-primary-300 text-xs"
                    >
                      Mark as read
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteNotification(notification.id)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {notificationList.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      )}
    </div>
  )
}
