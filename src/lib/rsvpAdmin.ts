import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const RSVP_ADMIN_COOKIE = "rsvp_admin_session"

const DEFAULT_ADMIN_PASSWORD = "EL2026"

function getAdminSecret() {
  return process.env.RSVP_ADMIN_SECRET || process.env.RSVP_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
}

export function getAdminPassword() {
  return process.env.RSVP_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword()
  const normalized = password.trim()
  const a = Buffer.from(normalized)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function createAdminSessionToken() {
  const issuedAt = Date.now().toString()
  const signature = createHmac("sha256", getAdminSecret()).update(issuedAt).digest("hex")
  return `${issuedAt}.${signature}`
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false

  const [issuedAt, signature] = token.split(".")
  if (!issuedAt || !signature) return false

  const expected = createHmac("sha256", getAdminSecret()).update(issuedAt).digest("hex")
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  if (!timingSafeEqual(a, b)) return false

  const ageMs = Date.now() - Number(issuedAt)
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < 1000 * 60 * 60 * 12
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(RSVP_ADMIN_COOKIE)?.value
  return verifyAdminSessionToken(token)
}
