import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// GET /api/notifications/unread-count - Get unread count
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth(request)

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)

    if (error) throw error

    return NextResponse.json({ count: count || 0 })
  } catch (error: any) {
    console.error("[v0] Error fetching unread count:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch unread count" },
      { status: error.status || 500 },
    )
  }
}
