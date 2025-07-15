"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("AuthGuard: Checking authentication...")
      const response = await fetch("/api/user")
      console.log("AuthGuard: /api/user response status:", response.status)
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push("/")
      }
    } catch (error) {
      console.error("AuthGuard: Error during authentication check:", error)
      setIsAuthenticated(false)
      router.push("/")
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-background to-fuchsia-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-rose-200">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-200 mb-2">Authentication Failed</h3>
          <p className="text-red-300">Please try logging in again.</p>
          <Button onClick={() => router.push("/")} className="mt-4 bg-primary-600 hover:bg-primary-700 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
