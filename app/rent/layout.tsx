import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Equipment Rental | Platnum Construction Tanzania",
  description:
    "Rent construction equipment in Tanzania. Excavators, bulldozers, cranes, concrete mixers, and more. Competitive rates and well-maintained machinery.",
  keywords:
    "equipment rental Tanzania, construction equipment hire, excavator rental, bulldozer rental, crane rental, construction machinery Tanzania",
}

export default function RentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
