import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/rentals - Get rentals (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user, supabase } = authResult
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = supabase
      .from("rentals")
      .select(`
        *,
        equipment:equipment_id (name, category, daily_rate),
        user:user_id (full_name, email, company_name)
      `)
      .order("created_at", { ascending: false })

    // Role-based filtering
    if (user.role !== "admin") {
      query = query.eq("user_id", user.id)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data: data || [], error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching rentals:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/rentals - Create a new rental request
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user, supabase } = authResult
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
        user_id: user.id,
        equipment_id,
        start_date,
        end_date,
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single()

    if (rentalError) throw rentalError

    // Get equipment details for notification
    const { data: equipment } = await supabase.from("equipment").select("name").eq("id", equipment_id).single()

    // Get all admin users
    const { data: admins } = await supabase.from("users").select("id, email").eq("role", "admin")

    // Create notifications for all admins
    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: "rental_request",
        title: "New Equipment Rental Request",
        message: `${user.full_name || user.email} has requested to rent ${equipment?.name || "equipment"} from ${start_date} to ${end_date}`,
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
              clientName: user.full_name || user.email,
              equipmentName: equipment?.name || "Equipment",
              startDate: start_date,
              endDate: end_date,
              notes: notes || "No additional notes",
            },
          }),
        })
      } catch (emailError) {
        console.error("[v0] Error sending email:", emailError)
      }
    }

    return NextResponse.json({ data: rental, error: null }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating rental:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
