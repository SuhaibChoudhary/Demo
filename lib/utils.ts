import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { NextRequest } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Request helpers -------------------------------------------------------

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) return forwarded.split(",")[0].trim()
  if (realIP) return realIP
  // Next.js edge/runtime may expose ip on the request object
  // @ts-ignore – "ip" is non-standard but present in Next.js runtime
  return request.ip ?? "unknown"
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") ?? "unknown"
}
