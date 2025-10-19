import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/api/auth"

// GET /api/equipment/[id] - Get single equipment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("equipment").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching equipment:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 404 })
  }
}

// PUT /api/equipment/[id] - Update equipment (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])

    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("equipment")
      .update({
        name: body.name,
        category: body.category,
        description: body.description,
        image_url: body.image_url,
        daily_rate: Number.parseFloat(body.daily_rate),
        status: body.status,
        specifications: body.specifications,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error updating equipment:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}

// DELETE /api/equipment/[id] - Delete equipment (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])

    const supabase = createServerClient()

    const { error } = await supabase.from("equipment").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    console.error("[v0] Error deleting equipment:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}
