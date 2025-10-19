import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/api/auth"

// GET /api/invoices - List invoices (filtered by role)
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get("status")
    const clientId = searchParams.get("client_id")

    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        client:client_id(*),
        project:project_id(*),
        rental:rental_id(*)
      `,
      )
      .order("created_at", { ascending: false })

    // Role-based filtering
    if (user.role === "client") {
      query = query.eq("client_id", user.id)
    }
    // Admins and project managers can see all invoices

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
    console.error("[v0] Error fetching invoices:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

// POST /api/invoices - Create new invoice (Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"])
    const supabase = createServerClient()
    const body = await request.json()

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        client_id: body.client_id,
        project_id: body.project_id || null,
        rental_id: body.rental_id || null,
        amount: Number.parseFloat(body.amount),
        tax: Number.parseFloat(body.tax || 0),
        total: Number.parseFloat(body.amount) + Number.parseFloat(body.tax || 0),
        status: body.status || "pending",
        due_date: body.due_date,
        notes: body.notes,
      })
      .select(
        `
        *,
        client:client_id(*),
        project:project_id(*),
        rental:rental_id(*)
      `,
      )
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating invoice:", error)
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}
