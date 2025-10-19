import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 })
    }

    // Get the role query parameter
    const searchParams = request.nextUrl.searchParams
    const roleFilter = searchParams.get("role")

    // Build the query
    let query = supabase.from("users").select("*").order("created_at", { ascending: false })

    // Apply role filter if provided
    if (roleFilter) {
      query = query.eq("role", roleFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("Error in users API:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
