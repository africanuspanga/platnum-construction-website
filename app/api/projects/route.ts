import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { emailTemplates } from "@/lib/email/resend"

// GET /api/projects - List projects (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get("status")
    const clientId = searchParams.get("client_id")

    let query = supabase
      .from("projects")
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*),
        milestones:project_milestones(*)
      `,
      )
      .order("created_at", { ascending: false })

    // Role-based filtering
    if (user.role === "client") {
      query = query.eq("client_id", user.id)
    } else if (user.role === "project_manager") {
      query = query.eq("manager_id", user.id)
    }
    // Admins can see all projects

    if (status) {
      query = query.eq("status", status)
    }

    if (clientId && user.role !== "client") {
      query = query.eq("client_id", clientId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error: any) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)
    const body = await request.json()

    const isClient = user.role === "client"
    const projectData = {
      name: body.name,
      description: body.description,
      client_id: isClient ? user.id : body.client_id,
      manager_id: body.manager_id || null,
      status: isClient ? "pending" : body.status || "planning",
      start_date: body.start_date,
      end_date: body.end_date,
      budget: body.budget ? Number.parseFloat(body.budget) : null,
      location: body.location || null,
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select(
        `
        *,
        client:client_id(*),
        manager:manager_id(*)
      `,
      )
      .single()

    if (error) throw error

    if (isClient) {
      // Get all admin users
      const { data: admins } = await supabase.from("users").select("id, email, full_name").eq("role", "admin")

      if (admins && admins.length > 0) {
        // Create notifications for all admins
        const notificationPromises = admins.map((admin) =>
          fetch(`${request.nextUrl.origin}/api/notifications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: admin.id,
              type: "project_request",
              title: "New Project Request",
              message: `${project.client.full_name || project.client.email} has requested a new project: ${project.name}`,
              link: "/admin/projects",
            }),
          }),
        )

        // Send email to first admin (or all admins if you prefer)
        const adminEmail = process.env.ADMIN_EMAIL || admins[0].email
        const emailPromise = fetch(`${request.nextUrl.origin}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: adminEmail,
            subject: "New Project Request",
            html: emailTemplates.projectRequest({
              clientName: project.client.full_name || project.client.email,
              clientEmail: project.client.email,
              projectName: project.name,
              description: project.description,
              budget: project.budget || 0,
              timeline: `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`,
              dashboardLink: `${request.nextUrl.origin}/admin/projects`,
            }),
          }),
        })

        await Promise.all([...notificationPromises, emailPromise])
      }
    }

    return NextResponse.json({ data: project, error: null }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating project:", error)
    return NextResponse.json(
      { data: null, error: error.message },
      { status: error.message.includes("Forbidden") ? 403 : 500 },
    )
  }
}
