import { NextResponse } from "next/server"
import { emailTemplates, sendEmail } from "@/lib/email/resend"

export async function POST(request: Request) {
  console.log("[v0] Rental submit API called")

  try {
    const body = await request.json()
    console.log("[v0] Body:", body)

    const { guest_name, guest_phone, guest_email, guest_company, notes, items, total_cost } = body

    if (!guest_name || !guest_phone || !items?.length) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and equipment selection are required" },
        { status: 400 },
      )
    }

    try {
      const emailHtml = emailTemplates.guestRentalRequest({
        guestName: guest_name,
        guestPhone: guest_phone,
        guestEmail: guest_email,
        guestCompany: guest_company,
        items: items,
        totalCost: total_cost,
        notes: notes,
      })

      await sendEmail({
        to: process.env.ADMIN_EMAIL || "info@platnumconstruction.co.tz",
        subject: `New Rental Request from ${guest_name}`,
        html: emailHtml,
      })

      console.log("[v0] Email sent successfully")
    } catch (emailError: any) {
      console.error("[v0] Email error:", emailError.message)
      return NextResponse.json({ success: false, error: "Failed to send email notification" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Rental request submitted successfully! You will be redirected to WhatsApp.",
    })
  } catch (error: any) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to submit request" }, { status: 500 })
  }
}
