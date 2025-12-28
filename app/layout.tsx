import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://platnumconstruction.co.tz"),
  title: {
    default: "Platnum Construction - You Dream It, We Build It",
    template: "%s | Platnum Construction",
  },
  description:
    "Platnum Construction Limited - Building excellence with safety, quality, and integrity since 2008. Residential, commercial, and civil construction projects across Tanzania.",
  keywords: [
    "construction Tanzania",
    "building construction",
    "road construction",
    "equipment rental Tanzania",
    "Platnum Construction",
    "construction company Dar es Salaam",
    "civil engineering Tanzania",
  ],
  authors: [{ name: "Platnum Construction Limited" }],
  creator: "Platnum Construction Limited",
  publisher: "Platnum Construction Limited",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://platnumconstruction.co.tz",
    title: "Platnum Construction - You Dream It, We Build It",
    description:
      "Leading construction company in Tanzania specializing in building, road construction, and equipment rental services.",
    siteName: "Platnum Construction",
    images: [
      {
        url: "/images/logo-full.png",
        width: 1200,
        height: 630,
        alt: "Platnum Construction Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platnum Construction - You Dream It, We Build It",
    description:
      "Leading construction company in Tanzania specializing in building, road construction, and equipment rental services.",
    images: ["/images/logo-full.png"],
  },
  verification: {
    google: "c84a6bc1ef92d42b",
  },
  generator: "v0.app",
  icons: {
    icon: "/images/favicon-logo.png",
    shortcut: "/images/favicon-logo.png",
    apple: "/images/favicon-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${dmSans.variable} ${spaceGrotesk.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
