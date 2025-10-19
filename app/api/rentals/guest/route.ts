import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("[v0] === Guest Rental API Called ===")

  try {
    const body = await request.json()
    console.log("[v0] Request body received:", JSON.stringify(body, null, 2))

    const { guest_name, guest_phone, guest_email, guest_company, notes, items, total_cost } = body

    // Validate required fields
    if (!guest_name || !guest_phone || !items || items.length === 0) {
      console.error("[v0] Validation failed - missing required fields")
      return NextResponse.json(
        { success: false, error: "Please provide your name, phone number, and select at least one equipment item" },
        { status: 400 },
      )
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = createServerClient()

    // Create rental requests for each item
    console.log("[v0] Creating", items.length, "rental records...")
    const rentalPromises = items.map(async (item: any) => {
      console.log("[v0] Processing equipment:", item.equipment_name)

      const { data, error } = await supabase
        .from("rentals")
        .insert({
          equipment_id: Number.parseInt(item.equipment_id), // Convert string to integer
          start_date: item.start_date,
          end_date: item.end_date,
          status: "pending",
          guest_name,
          guest_phone,
          guest_email: guest_email || null,
          guest_company: guest_company || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Database error:", error)
        throw new Error(`Failed to create rental: ${error.message}`)
      }

      console.log("[v0] Rental created with ID:", data.id)
      return data
    })

    const rentals = await Promise.all(rentalPromises)
    console.log("[v0] All", rentals.length, "rentals created successfully")

    // Send email notification to admin
    console.log("[v0] Preparing email notification...")
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const adminEmail = process.env.ADMIN_EMAIL || "info@platnumconstruction.co.tz"

      const emailPayload = {
        to: adminEmail,
        subject: `New Equipment Rental Request from ${guest_name}`,
        type: "rental_request",
        data: {
          guest_name,
          guest_phone,
          guest_email: guest_email || "Not provided",
          guest_company: guest_company || "Not provided",
          notes: notes || "None",
          items: items.map((item: any) => ({
            name: item.equipment_name,
            start_date: new Date(item.start_date).toLocaleDateString(),
            end_date: new Date(item.end_date).toLocaleDateString(),
            quantity: item.quantity,
            daily_rate: `TSH ${item.daily_rate}`,
            total_days: item.total_days,
          })),
          total_cost: `TSH ${total_cost.toLocaleString()}.00`,
        },
      }

      console.log("[v0] Sending email to:", adminEmail)
      const emailResponse = await fetch(`${siteUrl}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error("[v0] Email failed:", errorText)
      } else {
        console.log("[v0] Email sent successfully")
      }
    } catch (emailError: any) {
      console.error("[v0] Email error (non-fatal):", emailError.message)
      // Don't fail the request if email fails
    }

    console.log("[v0] Returning success response")
    return NextResponse.json({
      success: true,
      message: "Your rental request has been submitted successfully! We'll contact you shortly.",
      rentals,
    })
  } catch (error: any) {
    console.error("[v0] === ERROR in guest rental route ===")
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit rental request. Please try again or contact us directly.",
      },
      { status: 500 },
    )
  }
}
