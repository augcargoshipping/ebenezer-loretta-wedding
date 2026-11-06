"use client"

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { COUPLE, RSVP_CONTACTS, WEDDING_DATES } from "@/lib/constants"

const SPLASH = [
  { x: "-46vw", y: "-36vh", r: -140, d: 0, s: 54, c: "#c084fc", kind: "bloom" },
  { x: "42vw", y: "-32vh", r: 110, d: 0.02, s: 48, c: "#e9d5ff", kind: "bloom" },
  { x: "8vw", y: "-44vh", r: 30, d: 0.04, s: 36, c: "#a855f7", kind: "bloom" },
  { x: "-18vw", y: "-28vh", r: -40, d: 0, s: 28, c: "#d8b4fe", kind: "petal" },
  { x: "24vw", y: "-18vh", r: 70, d: 0.03, s: 32, c: "#c4b5fd", kind: "petal" },
  { x: "-38vw", y: "-8vh", r: -90, d: 0.05, s: 44, c: "#f0abfc", kind: "bloom" },
  { x: "40vw", y: "6vh", r: 130, d: 0.02, s: 40, c: "#a78bfa", kind: "bloom" },
  { x: "-8vw", y: "34vh", r: 20, d: 0.06, s: 50, c: "#e879f9", kind: "bloom" },
  { x: "16vw", y: "40vh", r: -60, d: 0.04, s: 30, c: "#ddd6fe", kind: "petal" },
  { x: "-28vw", y: "22vh", r: 80, d: 0.01, s: 38, c: "#c084fc", kind: "bloom" },
  { x: "32vw", y: "-40vh", r: -20, d: 0.07, s: 26, c: "#d8b4fe", kind: "petal" },
  { x: "-48vw", y: "16vh", r: 150, d: 0.03, s: 34, c: "#9333ea", kind: "bloom" },
  { x: "48vw", y: "24vh", r: -100, d: 0.05, s: 42, c: "#d98bff", kind: "bloom" },
  { x: "0vw", y: "-16vh", r: 15, d: 0, s: 58, c: "#a855f7", kind: "bloom" },
  { x: "-12vw", y: "8vh", r: -30, d: 0.02, s: 24, c: "#e9d5ff", kind: "petal" },
  { x: "14vw", y: "-6vh", r: 45, d: 0.04, s: 22, c: "#f5d0fe", kind: "petal" },
  { x: "-34vw", y: "-40vh", r: 100, d: 0.06, s: 30, c: "#c4b5fd", kind: "bloom" },
  { x: "28vw", y: "32vh", r: -80, d: 0.03, s: 36, c: "#e879f9", kind: "bloom" },
  { x: "-22vw", y: "40vh", r: 40, d: 0.08, s: 28, c: "#ddd6fe", kind: "petal" },
  { x: "6vw", y: "18vh", r: -15, d: 0.01, s: 20, c: "#a78bfa", kind: "dot" },
  { x: "-6vw", y: "-12vh", r: 25, d: 0.05, s: 18, c: "#f0abfc", kind: "dot" },
  { x: "36vw", y: "-22vh", r: -50, d: 0.02, s: 22, c: "#e7b0ff", kind: "dot" },
  { x: "-44vw", y: "32vh", r: 70, d: 0.07, s: 32, c: "#d8b4fe", kind: "petal" },
  { x: "18vw", y: "-38vh", r: 90, d: 0.04, s: 26, c: "#c084fc", kind: "petal" },
  { x: "-2vw", y: "42vh", r: -25, d: 0.06, s: 40, c: "#a855f7", kind: "bloom" },
  { x: "44vw", y: "-8vh", r: 120, d: 0.05, s: 24, c: "#e9d5ff", kind: "petal" },
] as const

function hasPhone(phone: string) {
  return /\d/.test(phone)
}

function SplashPiece({
  piece,
}: {
  piece: (typeof SPLASH)[number]
}) {
  return (
    <motion.span
      className="rsvp-splash-piece"
      style={{ width: piece.s, height: piece.kind === "dot" ? piece.s : piece.s * 1.35 }}
      initial={{ x: 0, y: 0, rotate: 0, scale: 0.15, opacity: 0 }}
      animate={{ x: piece.x, y: piece.y, rotate: piece.r, scale: 1, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.55, delay: piece.d, ease: [0.16, 1, 0.3, 1], times: [0, 0.12, 0.72, 1] }}
      aria-hidden="true"
    >
      {piece.kind === "dot" ? (
        <span className="rsvp-splash-dot" style={{ background: piece.c }} />
      ) : piece.kind === "bloom" ? (
        <svg viewBox="0 0 32 32" className="h-full w-full">
          <circle cx="16" cy="10" r="6" fill={piece.c} />
          <circle cx="23" cy="16" r="6" fill={piece.c} />
          <circle cx="16" cy="22" r="6" fill={piece.c} />
          <circle cx="9" cy="16" r="6" fill={piece.c} />
          <circle cx="16" cy="16" r="3.2" fill="#7b3fa6" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 28" className="h-full w-full">
          <ellipse cx="10" cy="14" rx="7" ry="12" fill={piece.c} />
          <ellipse cx="10" cy="15" rx="2" ry="8" fill="rgba(255,255,255,0.35)" />
        </svg>
      )}
    </motion.span>
  )
}

export function RsvpSection() {
  const reduced = useReducedMotion() ?? false
  const [phase, setPhase] = useState<"closed" | "burst" | "form">("closed")
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [attending, setAttending] = useState<"yes" | "no" | "">("")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [saving, setSaving] = useState(false)
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const sentRef = useRef(false)
  sentRef.current = sent

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => {
    setPhase("closed")
    if (sentRef.current) {
      setName("")
      setAttending("")
      setNote("")
      setError("")
      setSent(false)
    }
  }, [])

  useEffect(() => {
    if (phase !== "burst") return
    const id = window.setTimeout(() => setPhase("form"), 1100)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase === "closed") return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    const focusId =
      phase === "form" ? window.setTimeout(() => nameRef.current?.focus(), reduced ? 0 : 220) : 0
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
      window.clearTimeout(focusId)
    }
  }, [phase, reduced, close])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const guest = name.trim()
    if (!guest || !attending) {
      setError("Please add your name and let us know if you can attend.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guest,
          attending,
          message: note.trim(),
        }),
      })
      if (!response.ok) {
        setError("We couldn't save your reply. Please try again.")
        return
      }
      setSent(true)
    } catch {
      setError("We couldn't save your reply. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const dialog =
    mounted &&
    createPortal(
      <AnimatePresence>
        {phase !== "closed" ? (
          <motion.div
            className="rsvp-overlay"
            role="presentation"
            initial={{ opacity: 0, backgroundColor: "rgba(244, 232, 255, 0.15)" }}
            animate={{
              opacity: 1,
              backgroundColor: phase === "form" ? "rgba(62, 32, 96, 0.5)" : "rgba(244, 232, 255, 0.22)",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.35 }}
            onMouseDown={(event) => {
              if (phase === "form" && event.target === event.currentTarget) close()
            }}
          >
            {!reduced ? SPLASH.map((piece, index) => <SplashPiece key={index} piece={piece} />) : null}
            {phase === "form" ? (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="rsvp-card"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 18 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button type="button" className="rsvp-close" onClick={close} aria-label="Close">
                <X size={18} />
              </button>
              {sent ? (
                <div className="rsvp-thanks">
                  <p className="script text-4xl text-[#7b3fa6]">With joy</p>
                  <h3 id={titleId} className="serif mt-2 text-3xl text-[#3d215c]">
                    Thank you, {name.trim().split(" ")[0]}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#6a5680]">
                    {COUPLE.full} have your reply.
                  </p>
                  <button type="button" className="rsvp-submit" onClick={close}>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <p className="text-[10px] font-semibold tracking-[0.28em] text-[#7b3fa6] uppercase">Kindly reply</p>
                  <h3 id={titleId} className="serif mt-2 text-3xl leading-tight text-[#3d215c]">
                    Will you celebrate with us?
                  </h3>
                  <label className="rsvp-label" htmlFor="rsvp-name">
                    Your name
                  </label>
                  <input
                    id="rsvp-name"
                    ref={nameRef}
                    className="rsvp-input"
                    value={name}
                    autoComplete="name"
                    placeholder="Your name"
                    onChange={(event) => {
                      setName(event.target.value)
                      if (error) setError("")
                    }}
                  />
                  <p className="rsvp-label">Will you attend?</p>
                  <div className="rsvp-choice">
                    <button
                      type="button"
                      className={attending === "yes" ? "is-selected" : ""}
                      aria-pressed={attending === "yes"}
                      onClick={() => {
                        setAttending("yes")
                        if (error) setError("")
                      }}
                    >
                      Joyfully, yes
                    </button>
                    <button
                      type="button"
                      className={attending === "no" ? "is-selected" : ""}
                      aria-pressed={attending === "no"}
                      onClick={() => {
                        setAttending("no")
                        if (error) setError("")
                      }}
                    >
                      With regret, no
                    </button>
                  </div>
                  <label className="rsvp-label" htmlFor="rsvp-note">
                    A message for the couple <span>Optional</span>
                  </label>
                  <textarea
                    id="rsvp-note"
                    className="rsvp-input rsvp-note"
                    value={note}
                    rows={3}
                    placeholder="A few words for Ebenezer and Loretta"
                    onChange={(event) => setNote(event.target.value)}
                  />
                  {error ? <p className="rsvp-error">{error}</p> : null}
                  <button type="submit" className="rsvp-submit" disabled={saving}>
                    {saving ? "Sending..." : "Send reply"}
                  </button>
                </form>
              )}
            </motion.div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    )

  return (
    <section id="rsvp" className="rsvp-section px-6 py-16 text-center">
      <div className="mx-auto max-w-xl">
        <p className="ornament text-[10px] uppercase">Kindly reply</p>
        <h2 className="serif mt-3 text-4xl text-[#3d215c]">Will you come?</h2>
        <p className="mt-3 text-sm text-[#6a5680]">{WEDDING_DATES.display}</p>
        <button
          type="button"
          className="rsvp-invite"
          onClick={() => setPhase(reduced ? "form" : "burst")}
        >
          Confirm your attendance
        </button>
        <ul className="rsvp-people">
          {RSVP_CONTACTS.map((person) => {
            const phone = hasPhone(person.phone) ? person.phone : null
            return (
              <li key={person.name}>
                <a
                  href={`https://wa.me/${person.tel.replace("+", "")}?text=${encodeURIComponent(person.message)}`}
                  aria-label={phone ? `${person.name}, ${phone}` : person.name}
                >
                  <span className="serif">{person.name}</span>
                  {phone ? <span className="rsvp-contact-phone">{phone}</span> : null}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      {dialog}
    </section>
  )
}
