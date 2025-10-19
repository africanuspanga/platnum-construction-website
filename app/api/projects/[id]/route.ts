import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/api/auth"

// GET /api/projects/[id] - Get single project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*),
        milestones:project_milestones(*),
        rentals(*)
      `,
      )
      .eq("id", params.id)
      .single()

    if (error) throw error

    // Check permissions
    if (user.role === "client" && data.client_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }
    if (user.role === "project_manager" && data.manager_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching project:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 404 })
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()
    const body = await request.json()

    // Get existing project
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError) throw fetchError

    // Check permissions
    if (user.role === "project_manager" && existingProject.manager_id !== user.id) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }
    if (user.role === "client") {
      return NextResponse.json({ data: null, error: "Forbidden: Clients cannot update projects" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name: body.name,
        description: body.description,
        client_id: body.client_id,
        manager_id: body.manager_id,
        status: body.status,
        start_date: body.start_date,
        end_date: body.end_date,
        budget: body.budget ? Number.parseFloat(body.budget) : null,
        location: body.location,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*)
      `,
      )
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error updating project:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin"])
    const supabase = createServerClient()

    const { error } = await supabase.from("projects").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    console.error("[v0] Error deleting project:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}
