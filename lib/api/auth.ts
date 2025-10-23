import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function getAuthUser() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  return profile
}

export async function requireAuth(request?: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      console.error("[v0] No session found in requireAuth")
      return NextResponse.json({ data: null, error: "Unauthorized - No session" }, { status: 401 })
    }

    const { data: user, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (error || !user) {
      console.log("[v0] User not found in database, attempting to create profile")
      const serviceSupabase = createServiceRoleClient()
      const { data: newUser, error: insertError } = await serviceSupabase
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          role: session.user.user_metadata?.role || "client",
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating user profile:", insertError)
        return NextResponse.json(
          { data: null, error: "User profile not found and could not be created" },
          { status: 500 },
        )
      }

      return { user: newUser, supabase }
    }

    return { user, supabase }
  } catch (error: any) {
    console.error("[v0] Error in requireAuth:", error)
    return NextResponse.json({ data: null, error: error.message || "Authentication failed" }, { status: 401 })
  }
}

export async function requireRole(allowedRoles: string[]) {
  const authResult = await requireAuth()

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { user } = authResult

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ data: null, error: "Forbidden: Insufficient permissions" }, { status: 403 })
  }

  return user
}
