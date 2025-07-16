import { XCircle } from "lucide-react"

interface ErrorDisplayProps {
  message: string
  className?: string
}

export function ErrorDisplay({ message, className }: ErrorDisplayProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-red-200 mb-2">Error</h3>
      <p className="text-red-300">{message}</p>
    </div>
  )
}
