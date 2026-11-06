"use client"

import { useEffect, useRef, useState } from "react"
import { COUPLE } from "@/lib/constants"

const OPENER_VIDEO = "/video/gate-opener.mp4?v=5"
const OPENER_POSTER = "/images/opener-poster.jpg"

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
  const phaseRef = useRef<"idle" | "playing" | "leaving">("idle")
  const [phase, setPhase] = useState<"idle" | "playing" | "leaving">("idle")
  onDoneRef.current = onDone
  phaseRef.current = phase

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const finish = () => {
    if (phaseRef.current === "leaving") return
    if (revealTimer.current !== null) {
      window.clearTimeout(revealTimer.current)
      revealTimer.current = null
    }
    phaseRef.current = "leaving"
    setPhase("leaving")
  }

  useEffect(() => {
    if (phase !== "playing" || reduced) return
    const timer = window.setTimeout(() => finish(), 14000)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  useEffect(() => {
    if (phase !== "leaving") return
    const timer = window.setTimeout(() => onDoneRef.current(), reduced ? 180 : 1080)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

  const holdStill = () => {
    const video = videoRef.current
    if (!video || phaseRef.current !== "idle") return
    video.pause()
    if (video.currentTime > 0.05) video.currentTime = 0
  }

  const start = () => {
    if (phaseRef.current !== "idle") return
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
    phaseRef.current = "playing"
    setPhase("playing")
    video.muted = true
    const stall = window.setTimeout(() => {
      if (video.paused || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) finish()
    }, 4000)
    video.addEventListener(
      "playing",
      () => {
        window.clearTimeout(stall)
        const length = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * 1000 + 400 : 8000
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
        className="opener-video is-visible"
        src={OPENER_VIDEO}
        poster={OPENER_POSTER}
        playsInline
        muted
        preload="auto"
        onLoadedData={holdStill}
        onEnded={finish}
        onError={() => {
          if (phaseRef.current !== "idle") finish()
        }}
      />
      <button
        type="button"
        className="opener-stage"
        onClick={start}
        disabled={phase !== "idle"}
        aria-label={`Open the invitation from ${COUPLE.groom} and ${COUPLE.bride}`}
      />
      {phase === "idle" ? <span className="opener-hint script">Tap to open</span> : null}
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
