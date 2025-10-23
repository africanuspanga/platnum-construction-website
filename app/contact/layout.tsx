import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | Platnum Construction Tanzania",
  description:
    "Get in touch with Platnum Construction. Located in Mbezi Beach, Dar es Salaam. Contact us for construction services and equipment rental inquiries.",
  keywords:
    "contact Platnum Construction, construction company contact Tanzania, Dar es Salaam construction, Mbezi Beach",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
