import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/projects/[id]/files - Get all files for a project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth()

    const { data, error } = await supabase
      .from("project_files")
      .select(`
        *,
        user:uploaded_by(full_name, email)
      `)
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching project files:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/projects/[id]/files - Upload file (PM and Admin only)
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
      return NextResponse.json({ data: null, error: "Only PM or Admin can upload files" }, { status: 403 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (body.file_size > maxSize) {
      return NextResponse.json({ data: null, error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image", "pdf", "excel"]
    if (!allowedTypes.includes(body.file_type)) {
      return NextResponse.json(
        { data: null, error: "Invalid file type. Allowed: images, PDFs, Excel" },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("project_files")
      .insert({
        project_id: params.id,
        uploaded_by: user.id,
        file_url: body.file_url,
        file_name: body.file_name,
        file_type: body.file_type,
        file_size: body.file_size,
      })
      .select(`
        *,
        user:uploaded_by(full_name, email)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error uploading project file:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/files/[fileId] - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth()

    const url = new URL(request.url)
    const fileId = url.searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ data: null, error: "File ID required" }, { status: 400 })
    }

    // Check if user uploaded the file or is admin
    const { data: file } = await supabase.from("project_files").select("uploaded_by").eq("id", fileId).single()

    if (!file) {
      return NextResponse.json({ data: null, error: "File not found" }, { status: 404 })
    }

    if (user.role !== "admin" && file.uploaded_by !== user.id) {
      return NextResponse.json({ data: null, error: "Access denied" }, { status: 403 })
    }

    const { error } = await supabase.from("project_files").delete().eq("id", fileId)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null })
  } catch (error: any) {
    console.error("[v0] Error deleting project file:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
