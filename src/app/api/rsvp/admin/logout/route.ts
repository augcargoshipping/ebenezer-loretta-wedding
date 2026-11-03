import { NextResponse } from "next/server"
import { RSVP_ADMIN_COOKIE } from "@/lib/rsvpAdmin"

export const dynamic = "force-dynamic"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(RSVP_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
