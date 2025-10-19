import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// POST /api/projects/[id]/approve - Approve project request and assign manager
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(request)

    // Only admins can approve
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { manager_id } = body

    if (!manager_id) {
      return NextResponse.json({ error: "Project manager is required" }, { status: 400 })
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*)
      `,
      )
      .eq("id", id)
      .single()

    if (projectError) throw projectError

    // Update project status and assign manager
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        status: "active",
        manager_id: manager_id,
      })
      .eq("id", id)
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*)
      `,
      )
      .single()

    if (updateError) throw updateError

    // Get manager details
    const { data: manager } = await supabase.from("users").select("*").eq("id", manager_id).single()

    // Notify client
    await fetch(`${request.nextUrl.origin}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: project.client_id,
        type: "project_approved",
        title: "Project Request Approved",
        message: `Your project "${project.name}" has been approved and assigned to ${manager?.full_name || "a project manager"}!`,
        link: "/dashboard",
      }),
    })

    // Notify assigned project manager
    if (manager) {
      await fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: manager_id,
          type: "project_assigned",
          title: "New Project Assigned",
          message: `You have been assigned to project: ${project.name}`,
          link: "/manager/projects",
        }),
      })

      // Send email to project manager
      await fetch(`${request.nextUrl.origin}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: manager.email,
          subject: "New Project Assignment",
          html: `
            <h2>New Project Assignment</h2>
            <p>You have been assigned to a new project.</p>
            <p><strong>Project:</strong> ${project.name}</p>
            <p><strong>Client:</strong> ${project.client.full_name || project.client.email}</p>
            <p><strong>Budget:</strong> TSH ${project.budget?.toLocaleString() || "N/A"}</p>
            <p><strong>Timeline:</strong> ${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}</p>
            <p><a href="${request.nextUrl.origin}/manager/projects">View Project Details</a></p>
          `,
        }),
      })
    }

    // Send email to client
    await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: project.client.email,
        subject: "Project Request Approved",
        html: `
          <h2>Your Project Request Has Been Approved!</h2>
          <p>Great news! Your project request has been approved.</p>
          <p><strong>Project:</strong> ${project.name}</p>
          <p><strong>Project Manager:</strong> ${manager?.full_name || "Assigned"}</p>
          <p><strong>Status:</strong> Active</p>
          <p><a href="${request.nextUrl.origin}/dashboard">View Your Dashboard</a></p>
        `,
      }),
    })

    return NextResponse.json({ data: updatedProject })
  } catch (error: any) {
    console.error("[v0] Error approving project:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
