import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/rsvpAdmin"
import { clearRsvpSubmissions } from "@/lib/rsvpStore"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    await clearRsvpSubmissions()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to clear RSVP submissions:", error)
    return NextResponse.json({ error: "Unable to clear RSVP data right now." }, { status: 500 })
  }
}
