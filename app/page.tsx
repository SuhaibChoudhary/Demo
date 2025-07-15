import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DiscordLogoIcon } from "@radix-ui/react-icons"
import { Bot, Zap, Shield, Star, MessageSquare, Music, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header/Navbar */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-primary-400" />
          <span className="text-2xl font-bold">Noisy Bot</span>
        </div>
        <nav className="space-x-6 hidden md:flex">
          <Link href="#features" className="text-foreground hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-foreground hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-foreground hover:text-white transition-colors">
            Dashboard
          </Link>
        </nav>
        <Button
          asChild
          className="bg-discord-blue hover:bg-discord-blue/90 text-white px-6 py-2 rounded-xl font-semibold"
        >
          <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
            Add to Discord
          </a>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Elevate Your Discord Server with <span className="text-primary-400">Noisy Bot</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-10 animate-fade-in-up delay-200">
            The ultimate Discord bot for moderation, music, welcome messages, and more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-400">
            <Button
              asChild
              className="bg-discord-blue hover:bg-discord-blue/90 text-white px-8 py-3 rounded-xl font-semibold text-lg"
            >
              <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
                <DiscordLogoIcon className="w-6 h-6 mr-2" />
                Add Noisy Bot
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-white px-8 py-3 rounded-xl font-semibold text-lg bg-transparent"
            >
              <Link href="/login">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Powerful Features for Your Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Advanced Moderation</h3>
              <p className="text-foreground">
                Keep your server safe with auto-moderation, logging, and powerful commands.
              </p>
            </div>
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Music className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">High-Quality Music</h3>
              <p className="text-foreground">
                Stream your favorite tunes directly in voice channels with crystal clear audio.
              </p>
            </div>
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <MessageSquare className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Custom Welcome Messages</h3>
              <p className="text-foreground">
                Greet new members with personalized messages and assign roles automatically.
              </p>
            </div>
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Zap className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Blazing Fast Performance</h3>
              <p className="text-foreground">
                Experience minimal latency and maximum reliability with our optimized infrastructure.
              </p>
            </div>
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Star className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Dedicated Support</h3>
              <p className="text-foreground">Our team is always ready to help you with any questions or issues.</p>
            </div>
            <div className="neumorphic-card p-8 rounded-2xl flex flex-col items-center text-center">
              <Settings className="w-12 h-12 text-primary-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Intuitive Dashboard</h3>
              <p className="text-foreground">
                Manage all your bot settings with ease through our user-friendly web dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Placeholder) */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Flexible Pricing Plans</h2>
          <p className="text-xl text-foreground max-w-2xl mx-auto mb-10">
            Choose the plan that best fits your server's needs. Unlock more features and premium slots.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-8 py-3 rounded-xl font-semibold text-lg"
          >
            <Link href="/dashboard/premium">View All Plans</Link>
          </Button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-950 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Enhance Your Server?</h2>
          <p className="text-xl text-foreground mb-10">
            Join thousands of communities already using Noisy Bot to create a better Discord experience.
          </p>
          <Button
            asChild
            className="bg-discord-blue hover:bg-discord-blue/90 text-white px-8 py-3 rounded-xl font-semibold text-lg"
          >
            <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
              <DiscordLogoIcon className="w-6 h-6 mr-2" />
              Add Noisy Bot to Your Server
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-foreground border-t border-gray-800">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Noisy Bot. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
