import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: error.status || 500 },
    )
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { user_id, type, title, message, link } = body

    if (!user_id || !type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        message,
        link,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating notification:", error)
    return NextResponse.json({ error: error.message || "Failed to create notification" }, { status: 500 })
  }
}
