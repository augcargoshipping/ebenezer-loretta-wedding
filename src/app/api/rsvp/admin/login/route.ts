import { NextResponse } from "next/server"
import { RSVP_ADMIN_COOKIE, createAdminSessionToken, verifyAdminPassword } from "@/lib/rsvpAdmin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown }
    const password = typeof body.password === "string" ? body.password.trim() : ""

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(RSVP_ADMIN_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    })
    return response
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 })
  }
}
