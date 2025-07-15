export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground">Loading login page...</p>
      </div>
    </div>
  )
}
