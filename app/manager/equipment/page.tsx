"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function ManagerEquipmentPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || userRole !== "project_manager")) {
      router.push("/login")
    }
  }, [user, userRole, loading, router])

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
            <Link href="/manager">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
            Equipment Management
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#C5A572]/10 flex items-center justify-center">
                <Package className="w-12 h-12" style={{ color: "#C5A572" }} />
              </div>
            </div>
            <CardTitle className="text-3xl text-white mb-4">Equipment Management</CardTitle>
            <CardDescription className="text-lg text-slate-300">
              All equipment is centrally managed by the Company Admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Need Equipment Information?</h3>
              <p className="text-slate-300 mb-6">
                For information about equipment availability, specifications, or to request equipment for your projects,
                please contact the Company Admin team.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A572]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" style={{ color: "#C5A572" }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Email</p>
                    <a
                      href="mailto:info@platnumconstruction.co.tz"
                      className="text-[#C5A572] hover:text-[#B39562] font-medium text-lg"
                    >
                      info@platnumconstruction.co.tz
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A572]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" style={{ color: "#C5A572" }} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Contact Admin</p>
                    <p className="text-white font-medium">Available during business hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">What You Can Request:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#C5A572] mt-1">•</span>
                  <span>Equipment availability for specific dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C5A572] mt-1">•</span>
                  <span>Equipment specifications and capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C5A572] mt-1">•</span>
                  <span>Current equipment assignments to projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C5A572] mt-1">•</span>
                  <span>Equipment rental rates and terms</span>
                </li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button asChild className="bg-[#C5A572] hover:bg-[#B39562]">
                <a href="mailto:info@platnumconstruction.co.tz">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Admin Team
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
