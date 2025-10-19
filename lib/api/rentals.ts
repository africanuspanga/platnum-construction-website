import { createServerClient } from "@/lib/supabase/server"

export interface DateRange {
  start: string
  end: string
}

export async function checkEquipmentAvailability(equipmentId: string, startDate: string, endDate: string) {
  const supabase = createServerClient()

  // Check for overlapping rentals
  const { data: overlappingRentals, error } = await supabase
    .from("rentals")
    .select("*")
    .eq("equipment_id", equipmentId)
    .in("status", ["pending", "active"])
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

  if (error) throw error

  return {
    available: !overlappingRentals || overlappingRentals.length === 0,
    conflictingRentals: overlappingRentals || [],
  }
}

export function calculateRentalAmount(dailyRate: number, startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 // Include both start and end dates
  return dailyRate * days
}

export async function getAvailableEquipment(startDate: string, endDate: string) {
  const supabase = createServerClient()

  // Get all equipment
  const { data: allEquipment, error: equipmentError } = await supabase
    .from("equipment")
    .select("*")
    .eq("status", "available")

  if (equipmentError) throw equipmentError

  // Check availability for each equipment
  const availableEquipment = []
  for (const equipment of allEquipment || []) {
    const { available } = await checkEquipmentAvailability(equipment.id, startDate, endDate)
    if (available) {
      availableEquipment.push(equipment)
    }
  }

  return availableEquipment
}
