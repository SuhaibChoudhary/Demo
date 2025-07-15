"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LogIn, Bot, Shield, Zap, Users, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const errorMessages = {
  no_code: "Authorization code not received from Discord",
  auth_failed: "Authentication failed. Please try again.",
  discord_access_denied: "Discord access was denied",
  discord_invalid_request: "Invalid Discord OAuth request",
  discord_api_failed: "Failed to connect to Discord API",
  database_failed: "Database connection failed",
  invalid_state: "Invalid security token",
  default: "An error occurred during login",
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for authentication errors from URL params
    const errorParam = searchParams.get("error")
    if (errorParam) {
      const errorKey = errorParam as keyof typeof errorMessages
      setError(errorMessages[errorKey] || errorMessages.default)
    }

    // Check if user is already logged in
    checkAuthStatus()
  }, [searchParams])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/user", {
        credentials: "include", // Ensure cookies are sent
      })
      if (response.ok) {
        // User is already logged in, redirect to dashboard
        window.location.href = "/dashboard/guilds"
        return
      }
    } catch (error) {
      // User is not logged in, stay on login page
      console.log("User not authenticated")
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Clear any existing error from URL
      window.history.replaceState({}, document.title, window.location.pathname)

      // Redirect to Discord OAuth
      window.location.href = "/api/auth/discord"
    } catch (error) {
      setError("Failed to initiate login")
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError("")
    checkAuthStatus()
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800 flex items-center justify-center p-4">
        {" "}
        {/* Updated colors */}
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800 flex items-center justify-center p-4">
      {" "}
      {/* Updated colors */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 neumorphic rounded-2xl mb-4 animate-bounce-subtle">
            <Bot className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Noisy</h1> {/* Updated bot name */}
          <p className="text-foreground">Manage your Discord bot with elegance</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm mb-2">{error}</p>
                <Button
                  onClick={handleRetry}
                  variant="ghost"
                  className="text-red-300 hover:text-red-200 text-xs p-0 h-auto"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="neumorphic rounded-2xl p-8 animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-foreground text-sm">Sign in with Discord to continue</p>
          </div>

          <Button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:scale-100 animate-glow"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Continue with Discord
              </div>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs text-foreground">By continuing, you agree to our Terms of Service</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in">
          <div className="text-center">
            <div className="w-12 h-12 neumorphic rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-xs text-foreground">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 neumorphic rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-xs text-foreground">Fast</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 neumorphic rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-xs text-foreground">Reliable</p>
          </div>
        </div>
      </div>
    </div>
  )
}
