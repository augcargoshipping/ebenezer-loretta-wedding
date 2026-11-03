import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/rsvpAdmin"
import { listRsvpSubmissions } from "@/lib/rsvpStore"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const submissions = await listRsvpSubmissions()
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Failed to load RSVP submissions:", error)
    return NextResponse.json({ error: "Unable to load RSVP list right now." }, { status: 500 })
  }
}
