"use client"

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { COUPLE, RSVP_CONTACTS, WEDDING_DATES } from "@/lib/constants"

const SPLASH = [
  { x: "-34vw", y: "-28vh", r: -50, d: "0s", s: 22, c: "#ffffff", kind: "petal" },
  { x: "32vw", y: "-24vh", r: 40, d: "0.04s", s: 18, c: "#f7f3ee", kind: "petal" },
  { x: "4vw", y: "-36vh", r: 16, d: "0.02s", s: 28, c: "#f4ecff", kind: "bloom" },
  { x: "-16vw", y: "-14vh", r: -24, d: "0.06s", s: 14, c: "#fffaf6", kind: "dot" },
  { x: "18vw", y: "-10vh", r: 30, d: "0.03s", s: 16, c: "#e9d8ff", kind: "petal" },
  { x: "-28vw", y: "6vh", r: -36, d: "0.08s", s: 24, c: "#efe4ff", kind: "bloom" },
  { x: "30vw", y: "10vh", r: 48, d: "0.05s", s: 20, c: "#ffffff", kind: "petal" },
  { x: "-6vw", y: "22vh", r: 12, d: "0.07s", s: 26, c: "#f8f5ff", kind: "bloom" },
  { x: "12vw", y: "26vh", r: -20, d: "0.04s", s: 15, c: "#f7f3ee", kind: "petal" },
  { x: "-22vw", y: "18vh", r: 34, d: "0.09s", s: 12, c: "#fffdfb", kind: "dot" },
  { x: "24vw", y: "-32vh", r: -18, d: "0.06s", s: 18, c: "#e9d8ff", kind: "petal" },
  { x: "-40vw", y: "-6vh", r: 60, d: "0.03s", s: 16, c: "#f4ecff", kind: "dot" },
  { x: "40vw", y: "2vh", r: -44, d: "0.08s", s: 22, c: "#fffaf6", kind: "bloom" },
  { x: "0vw", y: "-8vh", r: 8, d: "0s", s: 30, c: "#ffffff", kind: "bloom" },
  { x: "-10vw", y: "8vh", r: -14, d: "0.05s", s: 13, c: "#efe4ff", kind: "dot" },
  { x: "8vw", y: "-18vh", r: 22, d: "0.02s", s: 17, c: "#f7f3ee", kind: "petal" },
] as const

function hasPhone(phone: string) {
  return /\d/.test(phone)
}

function SplashPiece({ piece }: { piece: (typeof SPLASH)[number] }) {
  return (
    <span
      className={`rsvp-splash-piece is-${piece.kind}`}
      style={
        {
          "--x": piece.x,
          "--y": piece.y,
          "--r": `${piece.r}deg`,
          "--d": piece.d,
          "--s": `${piece.s}px`,
          "--c": piece.c,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {piece.kind === "bloom" ? (
        <svg viewBox="0 0 32 32" className="rsvp-splash-bloom">
          <circle cx="16" cy="10" r="6" fill={piece.c} />
          <circle cx="23" cy="16" r="6" fill={piece.c} />
          <circle cx="16" cy="22" r="6" fill={piece.c} />
          <circle cx="9" cy="16" r="6" fill={piece.c} />
          <circle cx="16" cy="16" r="3.2" fill="#ffffff" />
        </svg>
      ) : null}
    </span>
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
    const id = window.setTimeout(() => setPhase("form"), 1280)
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
            {!reduced ? (
              <div className="rsvp-burst" aria-hidden="true">
                <span className="rsvp-splash-glow" />
                {SPLASH.map((piece, index) => (
                  <SplashPiece key={index} piece={piece} />
                ))}
              </div>
            ) : null}
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
