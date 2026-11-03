import { NextResponse } from "next/server"
import { addRsvpSubmission } from "@/lib/rsvpStore"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return ""
  return value.trim().replace(/\s+/g, " ").slice(0, max)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: unknown
      attending?: unknown
      message?: unknown
    }

    const name = cleanText(body.name, 80)
    const attending = body.attending === "yes" ? true : body.attending === "no" ? false : null
    const message = cleanText(body.message, 500)

    if (!name || attending === null) {
      return NextResponse.json({ error: "Name and attendance are required." }, { status: 400 })
    }

    const submission = await addRsvpSubmission(name, attending, message)
    return NextResponse.json({ ok: true, submission })
  } catch (error) {
    console.error("RSVP save failed:", error)
    return NextResponse.json({ error: "Unable to save RSVP right now. Please try again." }, { status: 500 })
  }
}
