import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Projects | Platnum Construction Tanzania",
  description:
    "View completed and ongoing construction projects by Platnum Construction across Tanzania. Educational, commercial, residential, and infrastructure projects.",
  keywords:
    "construction projects Tanzania, completed projects, ongoing projects, building portfolio, construction work Tanzania",
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
