"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getDiscordOAuthURL } from "@/lib/discord"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscordLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      console.error("Login Error:", error)
      // You might want to display this error to the user
    }
  }, [error])

  const handleLogin = () => {
    window.location.href = getDiscordOAuthURL()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <Card className="w-full max-w-md neumorphic-card text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white">Welcome Back!</CardTitle>
          <CardDescription className="text-foreground">Sign in to manage your Discord bot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-3 rounded-lg text-sm">
              <p>Login failed: {decodeURIComponent(error)}</p>
            </div>
          )}
          <Button
            onClick={handleLogin}
            className="w-full bg-discord-blue hover:bg-discord-blue/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
          >
            <DiscordLogoIcon className="w-6 h-6" />
            <span>Sign in with Discord</span>
          </Button>
          <p className="text-xs text-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms-of-service" className="text-primary-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-primary-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
