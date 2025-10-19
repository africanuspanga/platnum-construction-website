import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"

// PATCH /api/notifications/[id] - Mark as read
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error("[v0] Error updating notification:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: error.status || 500 },
    )
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase } = await requireAuth(request)
    const { id } = params

    const { error } = await supabase.from("notifications").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting notification:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: error.status || 500 },
    )
  }
}
