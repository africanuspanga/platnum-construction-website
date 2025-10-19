import { type NextRequest, NextResponse } from "next/server"
import { checkEquipmentAvailability } from "@/lib/api/rentals"

// POST /api/rentals/check-availability - Check if equipment is available for dates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipment_id, start_date, end_date } = body

    if (!equipment_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await checkEquipmentAvailability(equipment_id, start_date, end_date)

    return NextResponse.json({
      available: result.available,
      conflictingRentals: result.conflictingRentals,
      error: null,
    })
  } catch (error: any) {
    console.error("[v0] Error checking availability:", error)
    return NextResponse.json({ available: false, error: error.message }, { status: 500 })
  }
}
