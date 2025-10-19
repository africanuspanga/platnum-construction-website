import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/api/auth"

// GET /api/equipment - List all equipment (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams

    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase.from("equipment").select("*").order("created_at", { ascending: false })

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching equipment:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/equipment - Create new equipment (Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"])

    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("equipment")
      .insert({
        name: body.name,
        category: body.category,
        description: body.description,
        image_url: body.image_url,
        daily_rate: Number.parseFloat(body.daily_rate),
        status: body.status || "available",
        specifications: body.specifications || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating equipment:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}
