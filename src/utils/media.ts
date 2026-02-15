import { env } from "@/config/env"

const normalizePath = (path: string): string => path.replace(/^\/+/, "")

export const buildMediaUrl = (path: string): string => {
  if (!path) return ""

  const base = env.mediaBaseUrl?.replace(/\/+$/, "") || ""

  if (/^https?:\/\//i.test(path)) {
    if (!base) return path
    try {
      const url = new URL(path)
      const normalized = normalizePath(url.pathname)
      return normalized ? `${base}/${normalized}` : base
    } catch {
      return path
    }
  }

  if (!base) return path
  return `${base}/${normalizePath(path)}`
}
