import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// POST /api/rentals - Create a new rental request
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { equipment_id, start_date, end_date, notes } = body

    // Validate required fields
    if (!equipment_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields: equipment_id, start_date, end_date" },
        { status: 400 },
      )
    }

    // Create rental with pending status
    const { data: rental, error: rentalError } = await supabase
      .from("rentals")
      .insert({
        user_id: session.user.id,
        equipment_id,
        start_date,
        end_date,
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single()

    if (rentalError) {
      console.error("[v0] Error creating rental:", rentalError)
      return NextResponse.json({ error: rentalError.message }, { status: 500 })
    }

    // Get equipment details for notification
    const { data: equipment } = await supabase.from("equipment").select("name").eq("id", equipment_id).single()

    // Get user details
    const { data: user } = await supabase.from("users").select("full_name, email").eq("id", session.user.id).single()

    // Get all admin users
    const { data: admins } = await supabase.from("users").select("id, email").eq("role", "admin")

    // Create notifications for all admins
    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: "rental_request",
        title: "New Equipment Rental Request",
        message: `${user?.full_name || user?.email || "A client"} has requested to rent ${equipment?.name || "equipment"} from ${start_date} to ${end_date}`,
        link: "/admin",
        read: false,
      }))

      await supabase.from("notifications").insert(notifications)

      // Send email notification to admins
      try {
        await fetch(`${request.nextUrl.origin}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "rental_request",
            to: admins.map((a) => a.email).filter(Boolean),
            data: {
              clientName: user?.full_name || user?.email || "Client",
              equipmentName: equipment?.name || "Equipment",
              startDate: start_date,
              endDate: end_date,
              notes: notes || "No additional notes",
            },
          }),
        })
      } catch (emailError) {
        console.error("[v0] Error sending email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, rental }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error in rental creation:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// GET /api/rentals - Get rentals for current user or all rentals for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    let query = supabase
      .from("rentals")
      .select(`
        *,
        equipment:equipment_id (name, category, daily_rate),
        user:user_id (full_name, email)
      `)
      .order("created_at", { ascending: false })

    // If not admin, only show user's own rentals
    if (userData?.role !== "admin") {
      query = query.eq("user_id", session.user.id)
    }

    const { data: rentals, error: rentalsError } = await query

    if (rentalsError) {
      console.error("[v0] Error fetching rentals:", rentalsError)
      return NextResponse.json({ error: rentalsError.message }, { status: 500 })
    }

    return NextResponse.json({ rentals }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Error fetching rentals:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
