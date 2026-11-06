"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { Church, MapPin, Shirt, Sparkles } from "lucide-react"
import {
  COUPLE,
  DRESS_CODE,
  EVENTS,
  GIFTS,
  HASHTAG,
  HERO_TAGLINE,
  WELCOME_CLOSE,
  PARTY,
  PHOTOS,
  STORY,
  WEDDING_DATES,
} from "@/lib/constants"
import {
  AddToCalendar,
  CopyEmail,
  MusicButton,
  PhotoLightbox,
  ScrollProgress,
  SectionNav,
} from "./SiteExtras"
import { InvitationOpener } from "./InvitationOpener"
import { RsvpSection } from "./RsvpSection"
import { Bells, Bouquet, Cake, Dove, Envelope, Flutes, HeartSeal, Rings, ScrollMotif } from "./WeddingMotifs"

function FooterName() {
  const tapCount = useRef(0)
  const tapTimer = useRef<number | null>(null)

  const handleTap = () => {
    tapCount.current += 1
    if (tapTimer.current !== null) window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(() => {
      tapCount.current = 0
    }, 900)

    if (tapCount.current < 3) return
    tapCount.current = 0
    document.querySelector("audio")?.pause()
    window.open("/admin/rsvp", "_blank", "noopener,noreferrer")
  }

  return (
    <button type="button" className="footer-name script relative z-10" onClick={handleTap}>
      {COUPLE.full}
    </button>
  )
}

function useCountdown(iso: string) {
  const target = useMemo(() => new Date(iso).getTime(), [iso])
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (now === null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const FLORAL = "/images/floral-border.webp"

function FloralBand({ flip = false }: { flip?: boolean }) {
  return (
    <div className="floral-band pointer-events-none relative mx-auto h-16 w-full max-w-4xl overflow-hidden md:h-20" aria-hidden="true">
      <img
        src={FLORAL}
        alt=""
        className={`absolute inset-0 h-full w-full scale-[2.4] object-cover object-[center_46%] ${flip ? "rotate-180" : ""}`}
      />
    </div>
  )
}

export function WeddingSite() {
  const reduced = useReducedMotion() ?? false
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 70])
  const [sealed, setSealed] = useState(true)
  const count = useCountdown(WEDDING_DATES.countdown)
  const tiles = [
    { label: "Days", value: count.days },
    { label: "Hours", value: count.hours },
    { label: "Minutes", value: count.minutes },
    { label: "Seconds", value: count.seconds },
  ]

  return (
    <main className="page-wash">
      {sealed ? <InvitationOpener reduced={reduced} onDone={() => setSealed(false)} /> : null}
      <ScrollProgress />
      <SectionNav />
      <MusicButton audible={!sealed} />

      <section id="home" ref={heroRef} className="hero-banner relative isolate overflow-hidden text-center">
        <div className="hero-scene" aria-hidden="true">
          <motion.div className="hero-scene-shift h-[120%] w-full md:h-[120%]" style={{ y: bgY }}>
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/hero-background-mobile.jpg?v=5" />
              <img src="/images/hero-background.jpg?v=5" alt="" className="hero-scene-img" />
            </picture>
          </motion.div>
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-text relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-5 pt-[4.2rem] md:px-6 md:pt-[6vh]">
          <p className="hero-kicker">Together with our families</p>
          <h1 className="hero-names">
            <span>{COUPLE.groom}</span>
            <span className="hero-amp">&</span>
            <span>{COUPLE.bride}</span>
          </h1>
          <p className="script hero-tagline">{HERO_TAGLINE}</p>
          <p className="hero-forever">
            {WELCOME_CLOSE} <span>FOREVER</span>
          </p>
          <p className="hero-date">{WEDDING_DATES.display}</p>
          <p className="script hero-until">Until we say I do</p>
        </div>
        <div className="hero-couple">
          <div className="countdown-board">
            {tiles.map((item) => (
              <div key={item.label} className="countdown-cell">
                <p className="countdown-value serif" suppressHydrationWarning>
                  {String(item.value).padStart(2, "0")}
                </p>
                <p className="countdown-label">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="hero-couple-shot">
            <img src={`${PHOTOS.heroCutout}?v=5`} alt="" />
          </div>
        </div>
      </section>

      <section id="story" className="paper relative overflow-hidden px-6 py-16">
        <ScrollMotif className="top-3 right-2 hidden w-16 opacity-80 md:block" drift={22} spin={16}>
          <Dove />
        </ScrollMotif>
        <div className="relative z-10 mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-2">
          <div className="order-2 overflow-hidden rounded-[1.6rem] border border-[rgba(123,63,166,0.28)] shadow-[0_18px_40px_rgba(46,26,64,0.08)] md:order-1">
            <img src={PHOTOS.story} alt={`${COUPLE.full}`} className="block h-auto w-full object-cover" />
          </div>
          <div className="order-1 text-center md:order-2 md:text-left">
            <div className="mb-3 flex justify-center md:justify-start">
              <ScrollMotif flow className="w-14 md:w-16" drift={16} spin={14}>
                <Rings />
              </ScrollMotif>
            </div>
            <p className="ornament text-[10px] uppercase">Our story</p>
            <h2 className="serif mt-3 text-4xl text-[#3d215c]">Written in prayer</h2>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-[#6a5680] whitespace-pre-line">{STORY}</div>
          </div>
        </div>
      </section>

      <FloralBand />

      <section id="schedule" className="band-wash relative overflow-hidden px-6 py-16">
        <ScrollMotif className="top-14 left-0 w-12 opacity-80 md:top-4 md:left-6 md:w-20" drift={18} spin={-12}>
          <Bells />
        </ScrollMotif>
        <ScrollMotif className="top-16 right-0 w-12 opacity-75 md:right-8 md:w-16" drift={-30} spin={14}>
          <Flutes />
        </ScrollMotif>
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="ornament text-center text-[10px] uppercase">The celebration</p>
          <h2 className="serif mt-3 text-center text-4xl text-[#3d215c]">Schedule</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {EVENTS.map((event) => (
              <article key={event.id} className="card-invite rounded-3xl p-8">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ border: "1px solid rgba(123,63,166,0.35)", color: "#7b3fa6" }}
                >
                  {event.id === "ceremony" ? <Church className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <h3 className="serif mt-5 text-2xl text-[#3d215c]">{event.title}</h3>
                <p className="mt-2 text-sm tracking-wide text-[#7b3fa6] uppercase">{event.time}</p>
                <p className="mt-1 text-sm text-[#6a5680]">{event.date}</p>
                <p className="mt-5 font-medium text-[#2e1a40]">{event.venue}</p>
                {event.place ? <p className="text-sm text-[#6a5680]">{event.place}</p> : null}
                {event.note ? <p className="mt-3 text-sm leading-relaxed text-[#6a5680]">{event.note}</p> : null}
                <p className="mt-2 flex items-start gap-2 text-sm text-[#6a5680]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#7b3fa6" }} />
                  {event.address}
                </p>
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-xs font-semibold tracking-[0.16em] text-[#3d215c] uppercase underline underline-offset-4"
                >
                  Open in Maps
                </a>
                <div className="mt-5 overflow-hidden rounded-2xl">
                  <iframe
                    title={`${event.title} map`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&z=15&output=embed`}
                    className="h-40 w-full border-0"
                    loading="lazy"
                  />
                </div>
              </article>
            ))}
          </div>
          <div className="card-invite mx-auto mt-8 max-w-xl rounded-3xl p-6 text-center">
            <Shirt className="mx-auto h-5 w-5" style={{ color: "#7b3fa6" }} />
            <p className="mt-3 text-[11px] tracking-[0.2em] text-[#6a5680] uppercase">Dress code</p>
            <p className="serif mt-1 text-2xl text-[#3d215c]">{DRESS_CODE}</p>
          </div>
          <AddToCalendar />
        </div>
      </section>

      <FloralBand flip />

      <section id="party" className="relative overflow-hidden px-6 py-16">
        <ScrollMotif className="top-14 left-1 w-12 opacity-80 md:top-6 md:left-10 md:w-20" drift={18} spin={18}>
          <Rings />
        </ScrollMotif>
        <ScrollMotif className="right-1 bottom-6 w-12 opacity-75 md:right-12 md:w-16" drift={-22} spin={-16}>
          <HeartSeal />
        </ScrollMotif>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="ornament text-[10px] uppercase">Standing with us</p>
          <h2 className="serif mt-3 text-4xl text-[#3d215c]">Wedding party</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PARTY.map((person) => (
              <div key={person.name} className="card-invite rounded-3xl px-6 py-8">
                <p className="serif text-2xl text-[#3d215c]">{person.name}</p>
                <p className="mt-1 text-xs tracking-[0.18em] text-[#6a5680] uppercase">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FloralBand />

      <section id="gallery" className="band-wash relative overflow-hidden px-4 py-16 md:px-6">
        <ScrollMotif className="top-14 left-1 w-12 opacity-80 md:top-6 md:left-8 md:w-20" drift={16} spin={-8}>
          <Bouquet />
        </ScrollMotif>
        <ScrollMotif className="top-8 right-0 w-12 opacity-75 md:right-10 md:w-16" drift={-26} spin={12}>
          <Cake />
        </ScrollMotif>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="ornament text-[10px] uppercase">Gallery</p>
          <h2 className="serif mt-3 text-4xl text-[#3d215c]">Our photographs</h2>
          <p className="mt-4 text-sm text-[#6a5680]">A few of our favorite frames.</p>
          <PhotoLightbox />
        </div>
      </section>

      <FloralBand flip />

      <section id="gifts" className="relative overflow-hidden px-6 py-16">
        <ScrollMotif className="top-14 left-1 w-14 opacity-80 md:top-4 md:left-10 md:w-20" drift={16} spin={-8}>
          <Envelope />
        </ScrollMotif>
        <ScrollMotif className="right-1 bottom-4 w-12 opacity-75 md:right-12" drift={-20} spin={14}>
          <Rings />
        </ScrollMotif>
        <div className="relative z-10 mx-auto max-w-xl text-center">
          <h2 className="serif text-4xl text-[#3d215c]">Gifts</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6a5680]">
            Your presence is the gift. If you wish to bless us further, Interac e-Transfer is welcome.
          </p>
          <div className="mt-8 space-y-3">
            {GIFTS.map((gift) => (
              <CopyEmail key={gift.email} email={gift.email} label={gift.label} />
            ))}
          </div>
        </div>
      </section>

      <RsvpSection />

      <footer className="paper relative overflow-hidden px-6 pt-16 pb-14 text-center">
        <ScrollMotif className="top-3 left-3 w-9 opacity-75 md:left-[18%] md:w-12" drift={10} spin={12}>
          <Rings />
        </ScrollMotif>
        <ScrollMotif className="top-2 right-3 w-8 opacity-75 md:right-[18%] md:w-11" drift={-8} spin={-10}>
          <Bouquet />
        </ScrollMotif>
        <FooterName />
        <p className="relative z-10 mt-2 text-xs tracking-[0.2em] text-[#6a5680] uppercase">
          {WEDDING_DATES.short} · Halifax · {HASHTAG}
        </p>
      </footer>
    </main>
  )
}
