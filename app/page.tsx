import Link from "next/link"
import { Bot, Zap, Shield, Users, Code, MessageSquare, Music, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800 text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-8 h-8 text-primary-400 mr-2" />
          <span className="text-2xl font-bold text-white">Noisy</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl"
          >
            <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
              Add to Discord
            </a>
          </Button>
        </nav>
        {/* Mobile menu button - could add a Sheet/Dialog here */}
        <Button variant="ghost" className="md:hidden text-white">
          <Bot className="w-6 h-6" />
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-6rem)] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          {/* Background pattern or subtle animation */}
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-purple-800/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 neumorphic rounded-3xl mb-6 animate-bounce-subtle">
            <Bot className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            Elevate Your Discord Server with <span className="text-primary-400">Noisy</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-10 max-w-2xl mx-auto">
            The ultimate Discord bot dashboard for seamless server management, powerful moderation, and engaging
            features.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-3 px-8 rounded-xl text-lg font-medium animate-glow"
            >
              <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
                <Bot className="w-5 h-5 mr-2" />
                Add Noisy to Discord
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-400/50 text-primary-300 hover:bg-primary-500/10 hover:text-white py-3 px-8 rounded-xl text-lg font-medium bg-transparent"
            >
              <Link href="/login">
                <LogIn className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features at Your Fingertips</h2>
          <p className="text-xl text-foreground max-w-2xl mx-auto">
            Noisy provides everything you need to manage and grow your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Advanced Moderation</h3>
            <p className="text-foreground">Keep your server safe with auto-moderation, logging, and custom rules.</p>
          </div>

          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <Code className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Custom Commands</h3>
            <p className="text-foreground">Create personalized commands to automate tasks and engage members.</p>
          </div>

          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <Music className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Music Playback</h3>
            <p className="text-foreground">Enjoy high-quality music streaming directly in your voice channels.</p>
          </div>

          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <MessageSquare className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Welcome Messages</h3>
            <p className="text-foreground">Greet new members with custom messages and channel assignments.</p>
          </div>

          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">User & Guild Stats</h3>
            <p className="text-foreground">
              Track server activity, member growth, and bot usage with detailed analytics.
            </p>
          </div>

          <div className="neumorphic rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 neumorphic-inset rounded-2xl mb-6">
              <Zap className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Blazing Fast Performance</h3>
            <p className="text-foreground">Optimized for speed and reliability, ensuring a smooth experience.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Enhance Your Server?</h2>
        <p className="text-xl text-foreground max-w-2xl mx-auto mb-10">
          Join thousands of happy server owners who trust Noisy for their Discord bot needs.
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-4 px-10 rounded-xl text-xl font-medium animate-glow"
        >
          <a href="YOUR_BOT_INVITE_LINK_HERE" target="_blank" rel="noopener noreferrer">
            <Bot className="w-6 h-6 mr-3" />
            Add Noisy to Discord Now!
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900/20 py-8 text-center text-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0">
              <Bot className="w-6 h-6 text-primary-400 mr-2" />
              <span className="text-xl font-bold text-white">Noisy</span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Noisy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
