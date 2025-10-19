import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/api/auth"

// GET /api/invoices/[id] - Get single invoice
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        client:client_id(*),
        project:project_id(*),
        rental:rental_id(*)
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
    console.error("[v0] Error fetching invoice:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 404 })
  }
}

// PUT /api/invoices/[id] - Update invoice (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])
    const supabase = createServerClient()
    const body = await request.json()

    const updateData: any = {
      status: body.status,
      updated_at: new Date().toISOString(),
    }

    // If marking as paid, set paid_date
    if (body.status === "paid" && !body.paid_date) {
      updateData.paid_date = new Date().toISOString().split("T")[0]
    } else if (body.paid_date) {
      updateData.paid_date = body.paid_date
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const { data, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", params.id)
      .select(
        `
        *,
        client:client_id(*),
        project:project_id(*),
        rental:rental_id(*)
      `,
      )
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error updating invoice:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// DELETE /api/invoices/[id] - Delete invoice (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])
    const supabase = createServerClient()

    const { error } = await supabase.from("invoices").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    console.error("[v0] Error deleting invoice:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
