"use client"

import { useEffect, useRef, useState } from "react"
import { COUPLE } from "@/lib/constants"

const OPENER_VIDEO = "/video/gate-opener.mp4?v=3"
const OPENER_POSTER = "/images/opener-poster.jpg"

const CONFETTI_COLORS = [
  "#ff4d6d",
  "#ffd166",
  "#06d6a0",
  "#4cc9f0",
  "#f72585",
  "#ffe66d",
  "#fffaf3",
  "#ff9f1c",
  "#c77dff",
  "#80ed99",
  "#ff6b6b",
  "#48cae4",
  "#f4a261",
  "#e0aaff",
  "#ff8fab",
  "#fee440",
]
const CONFETTI_KINDS = ["rect", "rect", "strip", "square", "dot"] as const

const CONFETTI = Array.from({ length: 112 }, (_, index) => {
  const angle = (index * 2.399963) % (Math.PI * 2)
  const speed = 12 + ((index * 17) % 26)
  const lift = 8 + ((index * 11) % 14)
  const x = Math.cos(angle) * speed * (0.72 + (index % 5) * 0.09)
  const y = Math.sin(angle) * speed * 0.46 - lift
  const kind = CONFETTI_KINDS[index % CONFETTI_KINDS.length]
  const spin = (kind === "strip" ? 640 : 280) + ((index * 47) % 420)
  return {
    x: `${x.toFixed(2)}vw`,
    y: `${y.toFixed(2)}vh`,
    fall: `${16 + (index % 9) * 4.5}vh`,
    spin: `${index % 2 === 0 ? spin : -spin}deg`,
    d: `${((index * 3) % 9) * 0.012}s`,
    dur: `${1.15 + (index % 7) * 0.09}s`,
    s: 3 + (index % 4),
    c: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    kind,
  }
})

function cueMusic() {
  window.dispatchEvent(new Event("invitation-cue"))
}

export function InvitationOpener({
  reduced,
  onDone,
}: {
  reduced: boolean
  onDone: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const revealTimer = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  const [phase, setPhase] = useState<"idle" | "playing" | "leaving">("idle")
  const [videoOn, setVideoOn] = useState(false)
  onDoneRef.current = onDone

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const finish = () => {
    if (revealTimer.current !== null) {
      window.clearTimeout(revealTimer.current)
      revealTimer.current = null
    }
    setPhase((current) => (current === "leaving" ? current : "leaving"))
  }

  useEffect(() => {
    if (phase !== "playing" || reduced) return
    const timer = window.setTimeout(() => finish(), 8000)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  useEffect(() => {
    if (phase !== "leaving") return
    const timer = window.setTimeout(() => onDoneRef.current(), reduced ? 180 : 560)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  const start = () => {
    if (phase !== "idle") return
    cueMusic()
    if (reduced) {
      finish()
      return
    }
    const video = videoRef.current
    if (!video) {
      finish()
      return
    }
    setPhase("playing")
    video.muted = true
    const stall = window.setTimeout(() => {
      if (video.paused || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) finish()
    }, 4000)
    video.addEventListener(
      "playing",
      () => {
        window.clearTimeout(stall)
        const length = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 1000 + 150 : 3200
        revealTimer.current = window.setTimeout(() => finish(), length)
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
        onPlaying={() => setVideoOn(true)}
        onEnded={finish}
        onError={() => {
          if (phase !== "idle") finish()
        }}
      />
      <div className="opener-tint" aria-hidden="true" />
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
