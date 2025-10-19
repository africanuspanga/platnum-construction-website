"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Package } from "lucide-react"
import Link from "next/link"

export default function ClientRentalsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [rentals, setRentals] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    // TODO: Fetch rentals from Supabase
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button asChild variant="ghost" className="text-white hover:text-[#C5A572] mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
            My Equipment Rentals
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-slate-400">View and manage your equipment rentals</p>
          <Button asChild className="bg-[#C5A572] hover:bg-[#B39562]">
            <Link href="/rent">Browse Equipment</Link>
          </Button>
        </div>

        {rentals.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4" style={{ color: "#C5A572" }} />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Rentals</h3>
              <p className="text-slate-400 mb-6">You don't have any equipment rentals yet.</p>
              <Button asChild className="bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/rent">Browse Equipment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {rentals.map((rental) => (
              <Card key={rental.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{rental.equipment_name}</CardTitle>
                      <CardDescription className="text-slate-400">{rental.equipment_type}</CardDescription>
                    </div>
                    <Badge className="bg-[#C5A572]">{rental.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Start Date</p>
                      <p className="text-white flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {rental.start_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">End Date</p>
                      <p className="text-white flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {rental.end_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Cost</p>
                      <p className="text-white mt-1 font-semibold">${rental.total_cost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
