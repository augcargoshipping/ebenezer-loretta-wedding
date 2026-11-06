"use client"

import { useEffect, useRef, useState } from "react"
import { COUPLE } from "@/lib/constants"

const OPENER_VIDEO = "/video/gate-opener.mp4?v=2"
const OPENER_POSTER = "/images/opener-poster.jpg?v=3"

const CONFETTI_COLORS = ["#ffffff", "#fffdfb", "#f7f3ee", "#f4ecff", "#e9d8ff", "#f8f5ff", "#efe4ff", "#fffaf6"]
const CONFETTI_KINDS = ["rect", "rect", "strip", "square", "dot"] as const

function confettiPiece(index: number, reach: number) {
  const angle = (index * 2.399963) % (Math.PI * 2)
  const speed = reach + ((index * 17) % 18)
  const lift = 6 + ((index * 11) % 10)
  const x = Math.cos(angle) * speed * (0.62 + (index % 5) * 0.08)
  const y = Math.sin(angle) * speed * 0.42 - lift
  const kind = CONFETTI_KINDS[index % CONFETTI_KINDS.length]
  const spin = (kind === "strip" ? 220 : 120) + ((index * 29) % 160)
  return {
    x: `${x.toFixed(2)}vw`,
    y: `${y.toFixed(2)}vh`,
    fall: `${10 + (index % 7) * 3}vh`,
    spin: `${index % 2 === 0 ? spin : -spin}deg`,
    d: `${(index % 8) * 0.028}s`,
    dur: `${1.7 + (index % 5) * 0.12}s`,
    s: 4 + (index % 3),
    c: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    kind,
  }
}

const CONFETTI = Array.from({ length: 48 }, (_, index) => confettiPiece(index, 14))

const LANDING = Array.from({ length: 16 }, (_, index) => {
  const side = index % 2 === 0 ? -1 : 1
  const x = side * (18 + (index % 5) * 5.2)
  const y = -20 + (index % 8) * 7.5
  const kind = CONFETTI_KINDS[index % CONFETTI_KINDS.length]
  return {
    x: `${x.toFixed(2)}vw`,
    y: `${y.toFixed(2)}vh`,
    spin: `${side * (24 + (index * 17) % 64)}deg`,
    d: `${(index % 5) * 0.045}s`,
    s: 7 + (index % 3) * 2,
    c: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    kind,
  }
})

function cueMusic() {
  window.dispatchEvent(new Event("invitation-cue"))
}

export function SiteConfetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4600)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="site-confetti" aria-hidden="true">
      {LANDING.map((piece, index) => (
        <span
          key={index}
          className={`site-confetti-piece is-${piece.kind}`}
          style={
            {
              "--x": piece.x,
              "--y": piece.y,
              "--spin": piece.spin,
              "--d": piece.d,
              "--s": `${piece.s}px`,
              "--c": piece.c,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function InvitationOpener({
  reduced,
  onDone,
  onCelebrate,
}: {
  reduced: boolean
  onDone: () => void
  onCelebrate?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const revealTimer = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  const phaseRef = useRef<"idle" | "playing" | "leaving">("idle")
  const [phase, setPhase] = useState<"idle" | "playing" | "leaving">("idle")
  const [videoOn, setVideoOn] = useState(false)
  onDoneRef.current = onDone

  const setPhaseNow = (next: "idle" | "playing" | "leaving") => {
    phaseRef.current = next
    setPhase(next)
  }

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const holdClosed = () => {
      if (phaseRef.current !== "idle") return
      video.pause()
      if (video.currentTime > 0) video.currentTime = 0
    }
    video.addEventListener("play", holdClosed)
    video.addEventListener("loadeddata", holdClosed)
    holdClosed()
    return () => {
      video.removeEventListener("play", holdClosed)
      video.removeEventListener("loadeddata", holdClosed)
    }
  }, [])

  const finish = () => {
    if (revealTimer.current !== null) {
      window.clearTimeout(revealTimer.current)
      revealTimer.current = null
    }
    if (phaseRef.current === "leaving") return
    setPhaseNow("leaving")
  }

  useEffect(() => {
    if (phase !== "playing" || reduced) return
    const timer = window.setTimeout(() => finish(), 3600)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  useEffect(() => {
    if (phase !== "leaving") return
    const timer = window.setTimeout(() => onDoneRef.current(), reduced ? 180 : 920)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  const start = () => {
    if (phaseRef.current !== "idle") return
    cueMusic()
    if (!reduced) onCelebrate?.()
    if (reduced) {
      finish()
      return
    }
    const video = videoRef.current
    if (!video) {
      finish()
      return
    }
    setPhaseNow("playing")
    video.muted = true
    video.currentTime = 0
    const stall = window.setTimeout(() => {
      if (video.paused || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) finish()
    }, 1000)
    video.addEventListener(
      "playing",
      () => {
        window.clearTimeout(stall)
        revealTimer.current = window.setTimeout(() => finish(), 2750)
      },
      { once: true },
    )
    video.play().catch(() => {
      window.clearTimeout(stall)
      finish()
    })
  }

  return (
    <div className={`opener ${phase === "playing" ? "is-playing" : ""} ${phase === "leaving" ? "is-leaving" : ""}`}>
      <img src={OPENER_POSTER} alt="" className="opener-poster" />
      <video
        ref={videoRef}
        className={`opener-video${videoOn ? " is-visible" : ""}`}
        src={OPENER_VIDEO}
        poster={OPENER_POSTER}
        playsInline
        muted
        preload="auto"
        onPlaying={() => {
          if (phaseRef.current === "idle") {
            const video = videoRef.current
            if (!video) return
            video.pause()
            video.currentTime = 0
            return
          }
          setVideoOn(true)
        }}
        onEnded={finish}
        onError={() => {
          if (phase !== "idle") finish()
        }}
      />
      <div className="opener-tint" aria-hidden="true" />
      <p className="opener-invite">
        <span className="opener-invite-line">You are specially invited by</span>
        <span className="opener-invite-names">
          <span>{COUPLE.groom}</span>
          <span className="opener-amp">&</span>
          <span>{COUPLE.bride}</span>
        </span>
      </p>
      <button
        type="button"
        className="opener-stage"
        onClick={start}
        disabled={phase !== "idle"}
        aria-label={`Open the invitation from ${COUPLE.groom} and ${COUPLE.bride}`}
      />
      {phase !== "idle" && !reduced ? (
        <div className="opener-confetti" aria-hidden="true">
          {CONFETTI.map((piece, index) => (
            <span
              key={index}
              className={`opener-confetti-piece is-${piece.kind}`}
              style={
                {
                  "--x": piece.x,
                  "--y": piece.y,
                  "--fall": piece.fall,
                  "--spin": piece.spin,
                  "--d": piece.d,
                  "--dur": piece.dur,
                  "--s": `${piece.s}px`,
                  "--c": piece.c,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
      {phase === "idle" ? <span className="opener-hint">Tap to open</span> : null}
      {phase === "playing" ? (
        <button
          type="button"
          className="opener-skip"
          onClick={() => {
            cueMusic()
            finish()
          }}
        >
          Skip
        </button>
      ) : null}
    </div>
  )
}
