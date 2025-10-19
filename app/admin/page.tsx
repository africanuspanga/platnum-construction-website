"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationBell } from "@/components/notification-bell"
import {
  Users,
  Package,
  FileText,
  FolderKanban,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, userRole, loading, signOut } = useAuth()
  const [pendingRentals, setPendingRentals] = useState<any[]>([])
  const [pendingProjects, setPendingProjects] = useState<any[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && userRole && userRole !== "admin") {
      router.push("/login")
    }
    if (user && userRole === "admin") {
      fetchPendingRequests()
    }
  }, [user, userRole, loading, router])

  const fetchPendingRequests = async () => {
    try {
      const [rentalsRes, projectsRes] = await Promise.all([
        fetch("/api/rentals?status=pending"),
        fetch("/api/projects?status=pending"),
      ])

      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json()
        setPendingRentals(rentalsData.data || [])
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setPendingProjects(projectsData.data || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching pending requests:", error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const handleApproveRental = async (rentalId: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Rental approved successfully!")
        fetchPendingRequests()
      } else {
        alert("Failed to approve rental")
      }
    } catch (error) {
      console.error("[v0] Error approving rental:", error)
      alert("Failed to approve rental")
    }
  }

  const handleRejectRental = async (rentalId: string) => {
    const reason = prompt("Enter rejection reason (optional):")
    try {
      const response = await fetch(`/api/rentals/${rentalId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert("Rental rejected")
        fetchPendingRequests()
      } else {
        alert("Failed to reject rental")
      }
    } catch (error) {
      console.error("[v0] Error rejecting rental:", error)
      alert("Failed to reject rental")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const stats = [
    { label: "Pending Rentals", value: pendingRentals.length.toString(), icon: Clock, color: "#C5A572" },
    { label: "Pending Projects", value: pendingProjects.length.toString(), icon: Clock, color: "#C5A572" },
    { label: "Equipment Items", value: "18", icon: Package, color: "#1E3A5F" },
    { label: "Total Revenue", value: "$0", icon: TrendingUp, color: "#1E3A5F" },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-400">Full system control and management</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.user_metadata?.full_name || "Admin"}!</h2>
          <p className="text-slate-400">Manage all aspects of Platinum Construction ERP</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pending Requests Section */}
        {(pendingRentals.length > 0 || pendingProjects.length > 0) && (
          <div className="mb-8 space-y-6">
            <h3 className="text-2xl font-bold text-white">Pending Requests</h3>

            {/* Pending Rentals */}
            {pendingRentals.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5" style={{ color: "#C5A572" }} />
                    Pending Equipment Rentals ({pendingRentals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRentals.slice(0, 5).map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">{rental.equipment?.name || "Equipment"}</p>
                          <p className="text-sm text-slate-400">
                            Client: {rental.client?.full_name || rental.client?.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(rental.start_date).toLocaleDateString()} -{" "}
                            {new Date(rental.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRental(rental.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectRental(rental.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Projects */}
            {pendingProjects.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5" style={{ color: "#C5A572" }} />
                    Pending Project Requests ({pendingProjects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingProjects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">{project.name}</p>
                          <p className="text-sm text-slate-400">
                            Client: {project.client?.full_name || project.client?.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            Budget: TSH {project.budget?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                        <Button asChild size="sm" className="bg-[#C5A572] hover:bg-[#B39562]">
                          <Link href="/admin/projects">Review</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-slate-400">
                Manage clients, project managers, and admin users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Package className="w-8 h-8 mb-2" style={{ color: "#1E3A5F" }} />
              <CardTitle className="text-white">Equipment Management</CardTitle>
              <CardDescription className="text-slate-400">Add, edit, and manage equipment inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-[#152B47] text-white">
                <Link href="/admin/equipment">Manage Equipment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <FolderKanban className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">Project Management</CardTitle>
              <CardDescription className="text-slate-400">Oversee all projects and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/admin/projects">Manage Projects</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <FileText className="w-8 h-8 mb-2" style={{ color: "#1E3A5F" }} />
              <CardTitle className="text-white">Invoice Management</CardTitle>
              <CardDescription className="text-slate-400">Create and manage invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-[#152B47] text-white">
                <Link href="/admin/invoices">Manage Invoices</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Settings className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">System Settings</CardTitle>
              <CardDescription className="text-slate-400">Configure system preferences and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/admin/settings">System Settings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2" style={{ color: "#1E3A5F" }} />
              <CardTitle className="text-white">Reports & Analytics</CardTitle>
              <CardDescription className="text-slate-400">View detailed reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-[#152B47] text-white">
                <Link href="/admin/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
