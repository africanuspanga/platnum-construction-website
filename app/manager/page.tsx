"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderKanban, Package, Users, FileText, LogOut, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, userRole, loading, signOut } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    equipmentAssigned: 0,
    teamMembers: 0,
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && userRole && userRole !== "project_manager") {
      router.push("/login")
    }
    if (user && userRole === "project_manager") {
      fetchProjects()
      fetchStats()
    }
  }, [user, userRole, loading, router])

  const fetchProjects = async () => {
    if (user) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("manager_id", user.id)
        .in("status", ["planning", "in_progress", "active"])
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        setProjects(data || [])
      }
    }
  }

  const fetchStats = async () => {
    if (user) {
      // Fetch active projects count
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("manager_id", user.id)
        .in("status", ["planning", "in_progress", "active"])

      // Fetch equipment count
      const { count: equipmentCount } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", user.id)

      // Fetch team members count
      const { count: teamCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .in("role", ["client", "project_manager"])

      setStats({
        activeProjects: projectCount || 0,
        equipmentAssigned: equipmentCount || 0,
        teamMembers: teamCount || 0,
      })
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

  const statsDisplay = [
    { label: "Active Projects", value: stats.activeProjects.toString(), icon: FolderKanban },
    { label: "Equipment Assigned", value: stats.equipmentAssigned.toString(), icon: Package },
    { label: "Team Members", value: stats.teamMembers.toString(), icon: Users },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in_progress":
        return "bg-green-600"
      case "planning":
      case "pending":
        return "bg-yellow-600"
      case "completed":
        return "bg-blue-600"
      default:
        return "bg-slate-600"
    }
  }

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
          <Button asChild className="bg-[#C5A572] hover:bg-[#B39562]">
            <Link href="/manager/projects">
              <Plus className="w-4 h-4 mr-2" />
              View All Projects
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statsDisplay.map((stat, index) => {
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

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
            <CardDescription className="text-slate-400">Your currently active projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No active projects. Create a new project to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                        <p className="text-slate-400 text-sm">{project.description}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(project.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full mt-3 bg-[#C5A572] hover:bg-[#B39562]">
                      <Link href={`/manager/projects/${project.id}`}>View Details</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
