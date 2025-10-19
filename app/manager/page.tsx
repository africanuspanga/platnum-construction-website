"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Package, Users, FileText, LogOut, Plus } from "lucide-react"
import Link from "next/link"

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, userRole, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && userRole && userRole !== "project_manager") {
      router.push("/login")
    }
  }, [user, userRole, loading, router])

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
    { label: "Active Projects", value: "0", icon: FolderKanban },
    { label: "Equipment Assigned", value: "0", icon: Package },
    { label: "Team Members", value: "0", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              Project Manager Dashboard
            </h1>
            <p className="text-sm text-slate-400">Manage projects and equipment assignments</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome, {user?.user_metadata?.full_name || "Manager"}!
            </h2>
            <p className="text-slate-400">Manage your projects and track progress</p>
          </div>
          <Button className="bg-[#C5A572] hover:bg-[#B39562]">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                    <Icon className="w-8 h-8" style={{ color: "#C5A572" }} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <FolderKanban className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">My Projects</CardTitle>
              <CardDescription className="text-slate-400">View and manage your assigned projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/manager/projects">View Projects</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Package className="w-8 h-8 mb-2" style={{ color: "#1E3A5F" }} />
              <CardTitle className="text-white">Equipment Management</CardTitle>
              <CardDescription className="text-slate-400">Assign and track equipment for projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-[#152B47] text-white">
                <Link href="/manager/equipment">Manage Equipment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">Team Management</CardTitle>
              <CardDescription className="text-slate-400">Manage team members and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/manager/team">Manage Team</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <FileText className="w-8 h-8 mb-2" style={{ color: "#1E3A5F" }} />
              <CardTitle className="text-white">Reports</CardTitle>
              <CardDescription className="text-slate-400">Generate and view project reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-[#152B47] text-white">
                <Link href="/manager/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
            <CardDescription className="text-slate-400">Your currently active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center py-8">No active projects. Create a new project to get started.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
