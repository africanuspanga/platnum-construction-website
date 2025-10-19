import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// POST /api/rentals/[id]/reject - Reject rental request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(request)

    // Only admins can reject
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { reason } = body

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
      .update({ status: "rejected" })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Notify client
    await fetch(`${request.nextUrl.origin}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: rental.client_id,
        type: "rental_rejected",
        title: "Rental Request Declined",
        message: `Your rental request for ${rental.equipment.name} has been declined. ${reason ? `Reason: ${reason}` : ""}`,
        link: "/dashboard/rentals",
      }),
    })

    // Send email to client
    await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: rental.client.email,
        subject: "Rental Request Declined",
        html: `
          <h2>Rental Request Update</h2>
          <p>Unfortunately, your rental request has been declined.</p>
          <p><strong>Equipment:</strong> ${rental.equipment.name}</p>
          <p><strong>Dates:</strong> ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p><a href="${request.nextUrl.origin}/rent">Browse Other Equipment</a></p>
        `,
      }),
    })

    return NextResponse.json({ data: updatedRental })
  } catch (error: any) {
    console.error("[v0] Error rejecting rental:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
