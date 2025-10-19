import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/api/auth"

// GET /api/rentals/[id] - Get single rental
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("rentals")
      .select(
        `
        *,
        equipment:equipment_id(*),
        client:client_id(*),
        project:project_id(*)
      `,
      )
      .eq("id", params.id)
      .single()

    if (error) throw error

    // Check permissions
    if (user.role === "client" && data.client_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching rental:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 404 })
  }
}

// PUT /api/rentals/[id] - Update rental status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()
    const body = await request.json()

    // Get existing rental
    const { data: existingRental, error: fetchError } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError) throw fetchError

    // Check permissions
    if (user.role === "client" && existingRental.client_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }

    // Clients can only cancel their own pending rentals
    if (user.role === "client") {
      if (body.status !== "cancelled" || existingRental.status !== "pending") {
        return NextResponse.json({ data: null, error: "Forbidden: Can only cancel pending rentals" }, { status: 403 })
      }
    }

    // Update rental
    const { data, error } = await supabase
      .from("rentals")
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(
        `
        *,
        equipment:equipment_id(*),
        client:client_id(*),
        project:project_id(*)
      `,
      )
      .single()

    if (error) throw error

    // Update equipment status if rental is activated or completed
    if (body.status === "active") {
      await supabase.from("equipment").update({ status: "rented" }).eq("id", data.equipment_id)
    } else if (body.status === "completed" || body.status === "cancelled") {
      await supabase.from("equipment").update({ status: "available" }).eq("id", data.equipment_id)
    }

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error updating rental:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// DELETE /api/rentals/[id] - Delete rental (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])
    const supabase = await createServerClient()

    const { error } = await supabase.from("rentals").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    console.error("[v0] Error deleting rental:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}
