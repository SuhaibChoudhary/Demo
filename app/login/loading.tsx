export default function Loading() {
  // Loading fallback for the /login route segment
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-background to-purple-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground">Loading login...</p>
      </div>
    </div>
  )
}
