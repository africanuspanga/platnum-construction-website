import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/projects/[id]/updates - Get all updates for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("project_updates")
      .select(`
        *,
        user:created_by(full_name, email)
      `)
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching project updates:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/projects/[id]/updates - Create new update (PM and Admin only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()
    const body = await request.json()

    // Verify user is PM or Admin for this project
    const { data: project } = await supabase.from("projects").select("manager_id").eq("id", params.id).single()

    if (!project) {
      return NextResponse.json({ data: null, error: "Project not found" }, { status: 404 })
    }

    if (user.role !== "admin" && project.manager_id !== user.id) {
      return NextResponse.json({ data: null, error: "Only PM or Admin can add updates" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("project_updates")
      .insert({
        project_id: params.id,
        created_by: user.id,
        update_text: body.update_text,
        progress_percentage: body.progress_percentage || null,
      })
      .select(`
        *,
        user:created_by(full_name, email)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error creating project update:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
