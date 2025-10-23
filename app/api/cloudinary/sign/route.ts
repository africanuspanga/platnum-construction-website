import { type NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api/auth"

export async function POST(request: NextRequest) {
  try {
    // Require admin or manager role
    const user = await requireRole(["admin", "manager"])
    if (user instanceof NextResponse) return user

    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    // Generate signed URL for Cloudinary
    const crypto = require("crypto")
    const timestamp = Math.round(new Date().getTime() / 1000)
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!apiSecret) {
      return NextResponse.json({ error: "Cloudinary API secret not configured" }, { status: 500 })
    }

    // Create signature
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash("sha256").update(stringToSign).digest("hex")

    const signedUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/authenticated/s--${signature}--/v1/${publicId}.pdf?timestamp=${timestamp}`

    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error("[v0] Error generating signed URL:", error)
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
  }
}
