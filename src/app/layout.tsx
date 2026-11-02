import type { Metadata } from "next"
import { Cormorant_Garamond, Great_Vibes, Outfit, Playfair_Display } from "next/font/google"
import { COUPLE, HASHTAG, WEDDING_DATES } from "@/lib/constants"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
})

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: `${COUPLE.full} | Wedding Invitation ${HASHTAG}`,
  description: `You're invited to the wedding of ${COUPLE.groomFull} and ${COUPLE.brideFull} — ${WEDDING_DATES.display} in Halifax.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${script.variable} ${outfit.variable} ${display.variable} antialiased`}>{children}</body>
    </html>
  )
}
