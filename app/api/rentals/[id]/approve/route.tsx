import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// POST /api/rentals/[id]/approve - Approve rental request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(request)

    // Only admins can approve
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params

    // Get rental details
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .select(
        `
        *,
        equipment:equipment_id(*),
        client:client_id(*)
      `,
      )
      .eq("id", id)
      .single()

    if (rentalError) throw rentalError

    // Update rental status
    const { data: updatedRental, error: updateError } = await supabase
      .from("rentals")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Update equipment status to rented
    await supabase.from("equipment").update({ status: "rented" }).eq("id", rental.equipment_id)

    // Notify client
    await fetch(`${request.nextUrl.origin}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: rental.client_id,
        type: "rental_approved",
        title: "Rental Request Approved",
        message: `Your rental request for ${rental.equipment.name} has been approved!`,
        link: "/dashboard/rentals",
      }),
    })

    // Send email to client
    await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: rental.client.email,
        subject: "Rental Request Approved",
        html: `
          <h2>Your Rental Request Has Been Approved!</h2>
          <p>Good news! Your rental request has been approved.</p>
          <p><strong>Equipment:</strong> ${rental.equipment.name}</p>
          <p><strong>Dates:</strong> ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}</p>
          <p><strong>Total Cost:</strong> TSH ${rental.total_amount.toLocaleString()}</p>
          <p><a href="${request.nextUrl.origin}/dashboard/rentals">View Your Rentals</a></p>
        `,
      }),
    })

    return NextResponse.json({ data: updatedRental })
  } catch (error: any) {
    console.error("[v0] Error approving rental:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
