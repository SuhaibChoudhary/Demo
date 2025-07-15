"use client"

import { Button } from "@/components/ui/button"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Users, Server, Crown, Gift, CheckCircle, XCircle } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalGuilds: number
  totalPremiumUsers: number
  totalRedeemCodes: number
  usedRedeemCodes: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch admin statistics.")
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err)
      setError("An unexpected error occurred while fetching statistics.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-200 mb-2">Error</h3>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-foreground">Overview of your bot's performance and user base</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Total Guilds</p>
              <p className="text-2xl font-bold text-white">{stats?.totalGuilds.toLocaleString()}</p>
            </div>
            <Server className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Premium Users</p>
              <p className="text-2xl font-bold text-white">{stats?.totalPremiumUsers.toLocaleString()}</p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Total Redeem Codes</p>
              <p className="text-2xl font-bold text-white">{stats?.totalRedeemCodes.toLocaleString()}</p>
            </div>
            <Gift className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Used Redeem Codes</p>
              <p className="text-2xl font-bold text-white">{stats?.usedRedeemCodes.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="neumorphic rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm">Unused Redeem Codes</p>
              <p className="text-2xl font-bold text-white">
                {(stats?.totalRedeemCodes || 0) - (stats?.usedRedeemCodes || 0)}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Quick Links / Actions */}
      <div className="neumorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/admin/redeem-codes">
            <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium">
              <Gift className="w-5 h-5 mr-2" />
              Generate Redeem Codes
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium">
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Button>
          </Link>
          {/* Add more admin action buttons here */}
        </div>
      </div>
    </div>
  )
}
