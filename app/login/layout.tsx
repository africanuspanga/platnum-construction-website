import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Platnum Construction ERP System",
  description:
    "Access your Platnum Construction account. Manage projects, equipment rentals, and client information through our ERP management system.",
  keywords: "Platnum Construction login, ERP system, project management, client portal",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
