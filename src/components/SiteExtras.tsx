"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Copy, Music, VolumeX, X } from "lucide-react"
import { COUPLE, PHOTOS, SONG } from "@/lib/constants"

const LANDSCAPES = PHOTOS.gallery.filter((photo) => photo.layout === "wide")
const PORTRAITS = PHOTOS.gallery.filter((photo) => photo.layout === "tall")
const SLIDE_MS = 5200
const slideEase = [0.22, 1, 0.36, 1] as const

const NAV = [
  { href: "#home", label: "Home" },
  { href: "#story", label: "Story" },
  { href: "#schedule", label: "Schedule" },
  { href: "#gallery", label: "Photos" },
  { href: "#rsvp", label: "RSVP" },
]

export function SectionNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 flex justify-center px-3 transition-all duration-300 ${
        scrolled
          ? "translate-y-0 py-2 opacity-100 md:border-b md:border-[rgba(123,63,166,0.18)] md:bg-[rgba(250,248,246,0.94)] md:py-3 md:backdrop-blur-md"
          : "pointer-events-none -translate-y-2 py-2 opacity-0 md:pointer-events-auto md:translate-y-0 md:bg-transparent md:py-3 md:opacity-100"
      }`}
    >
      <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-[rgba(250,248,246,0.96)] px-0.5 py-0.5 shadow-[0_6px_16px_rgba(46,26,64,0.08)] md:gap-1 md:bg-transparent md:px-1 md:py-1 md:shadow-none">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold tracking-[0.12em] text-[#3d215c] uppercase md:px-3 md:py-1.5 md:text-[10px] md:tracking-[0.14em]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export function ScrollProgress() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setWidth(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-0.5">
      <div className="h-full bg-[#7b3fa6]" style={{ width: `${width}%` }} />
    </div>
  )
}

export function MusicButton({ audible = true }: { audible?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const pendingRef = useRef(false)
  const fadeRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const fadeIn = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    window.cancelAnimationFrame(fadeRef.current)
    const started = performance.now()
    const from = audio.volume
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 650)
      audio.volume = from + (1 - from) * progress
      if (progress < 1) fadeRef.current = window.requestAnimationFrame(tick)
    }
    fadeRef.current = window.requestAnimationFrame(tick)
  }, [])

  const play = useCallback(() => {
    const audio = audioRef.current
    if (!audio || pendingRef.current) return
    if (!audio.paused) {
      setIsPlaying(true)
      return
    }

    if (audio.currentTime < SONG.startAt) {
      audio.currentTime = SONG.startAt
    }

    pendingRef.current = true
    const attempt = audio.play()
    if (attempt === undefined) {
      pendingRef.current = false
      setIsPlaying(true)
      return
    }

    attempt
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
      .finally(() => {
        pendingRef.current = false
      })
  }, [])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      audio.currentTime = SONG.startAt
      void audio.play()
    }

    audio.volume = 0
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)

    const cue = () => {
      play()
      fadeIn()
    }
    window.addEventListener("invitation-cue", cue)

    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      window.removeEventListener("invitation-cue", cue)
      window.cancelAnimationFrame(fadeRef.current)
      audio.pause()
    }
  }, [fadeIn, play])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audible || !audio.paused) return
    play()
    fadeIn()
  }, [audible, fadeIn, play])

  return (
    <>
      <audio ref={audioRef} src={SONG.src} preload="auto" playsInline />
      <button
        type="button"
        onClick={() => (isPlaying ? pause() : play())}
        className="fixed right-4 bottom-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full text-[#3d215c] shadow-lg"
        style={{ background: "#faf8f6", border: "1px solid rgba(123,63,166,0.4)" }}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
      >
        {isPlaying ? <VolumeX className="h-4 w-4" /> : <Music className="h-4 w-4" />}
      </button>
    </>
  )
}

export function CopyEmail({ email, label }: { email: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(email)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
      className="card-invite flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm"
    >
      <span>
        <span className="tracking-[0.16em] text-[#6a5680] uppercase">{label}</span>
        <p className="mt-1 font-medium text-[#3d215c]">{email}</p>
        <p className="mt-1 text-[10px] tracking-[0.12em] text-[#7b3fa6] uppercase">{copied ? "Copied" : "Tap to copy"}</p>
      </span>
      <Copy className="h-4 w-4 text-[#7b3fa6]" />
    </button>
  )
}

export function AddToCalendar() {
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent("Ebenezer & Loretta Wedding") +
    "&dates=20261129T130000Z/20261130T000000Z" +
    "&details=" +
    encodeURIComponent("White Wedding at 9:00 AM at Scotiabank Theatre. The program is upstairs: when you walk in, the stairs are on your right. Reception at 11:00 AM at House.") +
    "&location=" +
    encodeURIComponent("190 Chain Lake Dr, Halifax, NS B3S 1C5")
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <a
        href="/ebenezer-loretta.ics"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase"
        style={{ border: "1px solid rgba(123,63,166,0.45)", color: "#3d215c" }}
      >
        <Calendar className="h-3.5 w-3.5" />
        Apple / Outlook
      </a>
      <a
        href={google}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-semibold tracking-[0.16em] text-[#fbf7ff] uppercase"
        style={{ background: "#7b3fa6" }}
      >
        <Calendar className="h-3.5 w-3.5" />
        Google Calendar
      </a>
    </div>
  )
}

export function PhotoLightbox() {
  const photos = PHOTOS.gallery
  const reduced = useReducedMotion() ?? false
  const [index, setIndex] = useState<number | null>(null)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const dragX = useRef<number | null>(null)

  const openPhoto = (src: string) => {
    setIndex(photos.findIndex((photo) => photo.src === src))
  }

  const goSlide = useCallback(
    (next: number) => {
      setSlide((next + PORTRAITS.length) % PORTRAITS.length)
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (index === null) return
      if (e.key === "Escape") setIndex(null)
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % photos.length))
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, photos.length])

  useEffect(() => {
    if (reduced || paused || index !== null) return
    const id = window.setInterval(() => goSlide(slide + 1), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [goSlide, index, paused, reduced, slide])

  useEffect(() => {
    const next = new window.Image()
    next.src = PORTRAITS[(slide + 1) % PORTRAITS.length].src
  }, [slide])

  const currentPortrait = PORTRAITS[slide]

  return (
    <>
      <div className="gallery-flow mt-10">
        <motion.button
          type="button"
          onClick={() => openPhoto(LANDSCAPES[0].src)}
          className="gallery-tile gallery-wide"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: slideEase }}
        >
          <img src={LANDSCAPES[0].src} alt={`${COUPLE.full} landscape`} />
        </motion.button>

        <motion.div
          className="portrait-show"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: slideEase, delay: 0.08 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="portrait-frame">
            <div
              className="portrait-stage"
              onPointerDown={(e) => {
                dragX.current = e.clientX
              }}
              onPointerUp={(e) => {
                if (dragX.current === null) return
                const delta = e.clientX - dragX.current
                dragX.current = null
                if (delta > 48) goSlide(slide - 1)
                else if (delta < -48) goSlide(slide + 1)
                else openPhoto(currentPortrait.src)
              }}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentPortrait.src}
                  src={currentPortrait.src}
                  alt={`${COUPLE.full} portrait ${slide + 1}`}
                  className="portrait-slide"
                  draggable={false}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0.35 }
                      : {
                          opacity: { duration: 0.9, ease: slideEase },
                          scale: { duration: SLIDE_MS / 1000, ease: "linear" },
                        }
                  }
                />
              </AnimatePresence>
            </div>

            <button
              type="button"
              className="portrait-nav portrait-nav-prev"
              onClick={() => goSlide(slide - 1)}
              aria-label="Previous portrait"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="portrait-nav portrait-nav-next"
              onClick={() => goSlide(slide + 1)}
              aria-label="Next portrait"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="portrait-meta">
            <p className="portrait-count">
              {String(slide + 1).padStart(2, "0")} / {String(PORTRAITS.length).padStart(2, "0")}
            </p>
            <div className="portrait-progress" aria-hidden="true">
              <span style={{ width: `${((slide + 1) / PORTRAITS.length) * 100}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => openPhoto(LANDSCAPES[1].src)}
          className="gallery-tile gallery-wide"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: slideEase, delay: 0.05 }}
        >
          <img src={LANDSCAPES[1].src} alt={`${COUPLE.full} landscape`} />
        </motion.button>
      </div>

      {index !== null ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/86 p-4"
          onClick={() => setIndex(null)}
        >
          <button type="button" className="absolute top-4 right-4 text-white" onClick={() => setIndex(null)} aria-label="Close">
            <X />
          </button>
          <button
            type="button"
            className="absolute left-3 rounded-full bg-white/15 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </button>
          <img
            src={photos[index].src}
            alt={`${COUPLE.full}`}
            className="max-h-[88vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-3 rounded-full bg-white/15 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation()
              setIndex((i) => (i === null ? i : (i + 1) % photos.length))
            }}
            aria-label="Next photo"
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </>
  )
}
