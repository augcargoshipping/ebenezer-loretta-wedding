"use client"

import { useEffect, useRef, useState } from "react"
import { COUPLE } from "@/lib/constants"

const OPENER_VIDEO = "/video/gate-opener.mp4"
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
    setPhase((current) => (current === "leaving" ? current : "leaving"))
  }

  useEffect(() => {
    if (phase !== "leaving") return
    const timer = window.setTimeout(() => onDoneRef.current(), reduced ? 180 : 720)
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
    video.play().catch(() => finish())
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
      <button
        type="button"
        className="opener-stage"
        onClick={start}
        disabled={phase !== "idle"}
        aria-label={`Open the invitation from ${COUPLE.groom} and ${COUPLE.bride}`}
      />
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
