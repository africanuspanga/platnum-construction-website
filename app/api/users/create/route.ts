import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/api/auth"

export async function POST(request: Request) {
  try {
    console.log("[v0] Create User POST - Starting...")

    // Check if user is admin or project_manager
    const authResult = await requireRole(["admin", "project_manager"])
    if (authResult instanceof NextResponse) {
      console.log("[v0] Create User POST - Auth failed")
      return authResult
    }

    console.log("[v0] Create User POST - Auth passed")

    const body = await request.json()
    const { email, full_name, role } = body

    console.log("[v0] Create User POST - Request body:", { email, full_name, role })

    // Validate required fields
    if (!email || !full_name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase admin client with service role
    const supabase = await createServerClient()

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    })

    if (authError) {
      console.error("[v0] Create User POST - Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("[v0] Create User POST - User created in auth:", authData.user.id)

    // Create the user profile in the users table
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        email,
        full_name,
        role,
      },
    ])

    if (profileError) {
      console.error("[v0] Create User POST - Profile error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    console.log("[v0] Create User POST - Success")

    return NextResponse.json(
      {
        data: {
          id: authData.user.id,
          email,
          full_name,
          role,
        },
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Create User POST - Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
