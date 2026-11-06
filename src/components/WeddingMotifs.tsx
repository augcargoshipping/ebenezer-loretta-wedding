"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function ScrollMotif({
  className,
  children,
  drift = 42,
  spin = 16,
  flow = false,
}: {
  className?: string
  children: ReactNode
  drift?: number
  spin?: number
  flow?: boolean
}) {
  const reduced = useReducedMotion() ?? false
  const [mode, setMode] = useState<"scroll" | "drift" | "still">("scroll")

  useEffect(() => {
    if (reduced) {
      setMode("still")
      return
    }
    const query = window.matchMedia("(max-width: 767px)")
    const apply = () => setMode(query.matches ? "drift" : "scroll")
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [reduced])

  if (mode !== "scroll") {
    return (
      <div
        className={`pointer-events-none z-0 text-[#7b3fa6] ${flow ? "relative" : "absolute"} ${mode === "drift" ? "motif-drift" : ""} ${className ?? ""}`}
        aria-hidden="true"
      >
        {children}
      </div>
    )
  }

  return <ScrollLinked className={className} drift={drift} spin={spin} flow={flow}>{children}</ScrollLinked>
}

function ScrollLinked({
  className,
  children,
  drift,
  spin,
  flow,
}: {
  className?: string
  children: ReactNode
  drift: number
  spin: number
  flow: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift])
  const rotate = useTransform(scrollYProgress, [0, 1], [-spin, spin])

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate }}
      className={`pointer-events-none z-0 text-[#7b3fa6] ${flow ? "relative" : "absolute"} ${className ?? ""}`}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  )
}

export function Rings() {
  return (
    <svg viewBox="0 0 96 72" className="h-auto w-full">
      <circle cx="36" cy="40" r="18" {...stroke} />
      <circle cx="60" cy="40" r="18" {...stroke} />
      <path d="M48 14l2.4 4.6 5 .5-3.8 3.2 1.2 4.9L48 24.8 43.2 27.2l1.2-4.9-3.8-3.2 5-.5L48 14z" fill="#c9a0e8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

export function Bells() {
  return (
    <svg viewBox="0 0 100 86" className="h-auto w-full">
      <path d="M16 54c2-16 11-26 20-26s18 10 20 26c1 4-2 7-7 7H23c-5 0-8-3-7-7z" fill="#ead9fb" stroke="currentColor" strokeWidth="1.7" />
      <path d="M44 54c2-16 11-26 20-26s18 10 20 26c1 4-2 7-7 7H51c-5 0-8-3-7-7z" fill="#faf8f6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M30 28c0-3.5 2.6-6 6-6s6 2.5 6 6" {...stroke} />
      <path d="M58 28c0-3.5 2.6-6 6-6s6 2.5 6 6" {...stroke} />
      <circle cx="36" cy="66" r="2.4" fill="currentColor" />
      <circle cx="64" cy="66" r="2.4" fill="currentColor" />
      <path d="M46 20c-5 2-8 7-6 10 3-2 6-2 9 0 3 2 6 2 9 0 2-3-1-8-6-10-2 2.4-5 2.4-6 0z" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function Dove() {
  return (
    <svg viewBox="0 0 110 70" className="h-auto w-full">
      <path
        d="M6 38c16-1 26-12 36-20 1 9 9 16 20 18-9 2-14 9-13 18 8-7 20-9 34-6-12 9-28 11-42 6-5 7-12 9-19 6 5-7 5-14 2-20-8 2-15 1-18-2z"
        fill="#faf8f6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M62 34c6 1 10 0 14-3" {...stroke} />
      <circle cx="70" cy="30" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function Flutes() {
  return (
    <svg viewBox="0 0 96 100" className="h-auto w-full">
      <g transform="rotate(-12 34 50)">
        <path d="M26 16h12l-2 48c0 7-2.2 12-4 12s-4-5-4-12L26 16z" fill="#faf8f6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M28 28h8" {...stroke} />
      </g>
      <g transform="rotate(12 64 50)">
        <path d="M58 16h12l2 48c0 7-2.2 12-6 12s-6-5-6-12l-2-48z" fill="#ead9fb" stroke="currentColor" strokeWidth="1.6" />
        <path d="M60 28h8" {...stroke} />
      </g>
      <circle cx="48" cy="14" r="1.5" fill="currentColor" />
      <circle cx="54" cy="8" r="1.1" fill="currentColor" />
      <circle cx="42" cy="9" r="1" fill="currentColor" />
    </svg>
  )
}

export function Bouquet() {
  return (
    <svg viewBox="0 0 84 78" className="h-auto w-full">
      <path d="M42 74v-16" {...stroke} />
      <path d="M33 62c5 5 13 5 18 0" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="42" cy="30" r="12" fill="#ead9fb" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="26" cy="34" r="10" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="58" cy="34" r="10" fill="#c4a0e6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="33" cy="18" r="9" fill="#faf8f6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="52" cy="17" r="9" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="42" cy="28" r="2.4" fill="currentColor" />
    </svg>
  )
}

export function Cake() {
  return (
    <svg viewBox="0 0 90 96" className="h-auto w-full">
      <path d="M18 78h54v6c0 3-2 5-5 5H23c-3 0-5-2-5-5v-6z" fill="#ead9fb" stroke="currentColor" strokeWidth="1.6" />
      <rect x="24" y="54" width="42" height="24" rx="4" fill="#faf8f6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="32" y="36" width="26" height="18" rx="4" fill="#ead9fb" stroke="currentColor" strokeWidth="1.6" />
      <path d="M45 36c-2-6 2-10 0-16 4 4 8 4 10 0-2 8 2 12 0 16" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.2" />
      <path d="M30 64h30M38 44h14" {...stroke} />
    </svg>
  )
}

export function HeartSeal() {
  return (
    <svg viewBox="0 0 80 78" className="h-auto w-full">
      <path
        d="M40 68C18 52 8 40 8 26 8 16 16 10 24 10c6 0 11 3 16 9 5-6 10-9 16-9 8 0 16 6 16 16 0 14-10 26-32 42z"
        fill="#faf8f6"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="40" cy="34" r="8" {...stroke} />
      <path d="M40 22l1.6 3.2 3.4.3-2.6 2.2.8 3.3L40 29.2l-3.2 1.8.8-3.3-2.6-2.2 3.4-.3L40 22z" fill="#c9a0e8" />
    </svg>
  )
}

export function Envelope() {
  return (
    <svg viewBox="0 0 100 74" className="h-auto w-full">
      <rect x="8" y="16" width="84" height="52" rx="4" fill="#faf8f6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 18l40 28 40-28" {...stroke} />
      <circle cx="50" cy="42" r="7" fill="#d7b4ee" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
