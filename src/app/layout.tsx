import type { Metadata } from "next"
import { COUPLE, HASHTAG, WEDDING_DATES } from "@/lib/constants"
import "./globals.css"

const fontHref =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Outfit:wght@300;400;500;600&family=Playfair+Display:ital,wght@1,500;1,600&display=swap"

export const metadata: Metadata = {
  title: `${COUPLE.full} | Wedding Invitation ${HASHTAG}`,
  description: `You're invited to the wedding of ${COUPLE.groomFull} and ${COUPLE.brideFull} — ${WEDDING_DATES.display} in Halifax.`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontHref} rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
