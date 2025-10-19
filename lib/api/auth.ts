import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

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
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const { data: user, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  if (error || !user) {
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
      throw new Error("User profile not found and could not be created")
    }

    return { user: newUser, supabase }
  }

  return { user, supabase }
}

export async function requireRole(allowedRoles: string[]) {
  const { user } = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }
  return user
}
