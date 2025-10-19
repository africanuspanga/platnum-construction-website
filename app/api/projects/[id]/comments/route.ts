import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/projects/[id]/comments - Get all comments for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("project_comments")
      .select(`
        *,
        user:user_id(full_name, email, role)
      `)
      .eq("project_id", params.id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching project comments:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/projects/[id]/comments - Add comment (Client, PM, or Admin)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()
    const body = await request.json()

    // Verify user has access to this project
    const { data: project } = await supabase
      .from("projects")
      .select("client_id, manager_id")
      .eq("id", params.id)
      .single()

    if (!project) {
      return NextResponse.json({ data: null, error: "Project not found" }, { status: 404 })
    }

    if (user.role !== "admin" && project.client_id !== user.id && project.manager_id !== user.id) {
      return NextResponse.json({ data: null, error: "Access denied" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("project_comments")
      .insert({
        project_id: params.id,
        user_id: user.id,
        comment_text: body.comment_text,
      })
      .select(`
        *,
        user:user_id(full_name, email, role)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error creating project comment:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
