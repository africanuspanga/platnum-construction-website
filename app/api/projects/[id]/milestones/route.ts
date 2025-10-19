import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/api/auth"

// POST /api/projects/[id]/milestones - Add milestone to project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(["admin", "project_manager"])
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("project_milestones")
      .insert({
        project_id: params.id,
        title: body.title,
        description: body.description,
        due_date: body.due_date,
        status: body.status || "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating milestone:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
