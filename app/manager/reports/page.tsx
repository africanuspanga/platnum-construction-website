"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  MessageSquare,
  FileText,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

type ManagerReportStats = {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  totalBudget: number
  averageProgress: number
  totalTeamMembers: number
  totalUpdates: number
  totalComments: number
  equipmentUsed: number
}

export default function ManagerReportsPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [stats, setStats] = useState<ManagerReportStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    totalBudget: 0,
    averageProgress: 0,
    totalTeamMembers: 0,
    totalUpdates: 0,
    totalComments: 0,
    equipmentUsed: 0,
  })
  const [loadingData, setLoadingData] = useState(true)
  const [timeRange, setTimeRange] = useState("all")
  const [projects, setProjects] = useState<any[]>([])

  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && (!user || userRole !== "project_manager")) {
      router.push("/login")
    }
    if (user && userRole === "project_manager") {
      fetchReportData()
    }
  }, [user, userRole, loading, router, timeRange])

  const fetchReportData = async () => {
    if (!user) return

    try {
      console.log("[v0] Fetching report data for manager:", user.id)

      // Fetch projects managed by this user
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("manager_id", user.id)

      if (projectsError) {
        console.log("[v0] Error fetching projects:", projectsError)
        throw projectsError
      }

      const allProjects = projectsData || []
      console.log("[v0] Found projects:", allProjects.length)
      setProjects(allProjects)

      // Calculate project stats
      const totalProjects = allProjects.length
      const activeProjects = allProjects.filter((p) => p.status === "in_progress").length
      const completedProjects = allProjects.filter((p) => p.status === "completed").length
      const onHoldProjects = allProjects.filter((p) => p.status === "on_hold").length
      const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0)

      // Fetch project updates
      const projectIds = allProjects.map((p) => p.id)

      let totalUpdates = 0
      let averageProgress = 0

      if (projectIds.length > 0) {
        const { data: updatesData } = await supabase.from("project_updates").select("*").in("project_id", projectIds)
        totalUpdates = updatesData?.length || 0

        // Calculate average progress from updates
        const progressValues = updatesData?.map((u) => u.progress_percentage).filter((p) => p !== null) || []
        averageProgress =
          progressValues.length > 0 ? progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length : 0
      }

      // Fetch project comments
      let totalComments = 0
      if (projectIds.length > 0) {
        const { data: commentsData } = await supabase.from("project_comments").select("*").in("project_id", projectIds)
        totalComments = commentsData?.length || 0
      }

      // Fetch team assignments
      let totalTeamMembers = 0
      if (projectIds.length > 0) {
        const { data: assignmentsData } = await supabase
          .from("project_assignments")
          .select("user_id")
          .in("project_id", projectIds)

        const uniqueTeamMembers = new Set(assignmentsData?.map((a) => a.user_id) || [])
        totalTeamMembers = uniqueTeamMembers.size
      }

      // Fetch equipment rentals for these projects
      let equipmentUsed = 0
      if (projectIds.length > 0) {
        const { data: rentalsData } = await supabase.from("rentals").select("*").in("project_id", projectIds)
        equipmentUsed = rentalsData?.length || 0
      }

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalBudget,
        averageProgress: Math.round(averageProgress),
        totalTeamMembers,
        totalUpdates,
        totalComments,
        equipmentUsed,
      })

      console.log("[v0] Report data loaded successfully")
    } catch (error: any) {
      console.error("[v0] Error fetching report data:", error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const handleExportReport = () => {
    console.log("[v0] Export button clicked")
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        manager: user?.user_metadata?.full_name || user?.email,
        timeRange,
        stats,
        projects: projects.map((p) => ({
          name: p.name,
          status: p.status,
          budget: p.budget,
          start_date: p.start_date,
          end_date: p.end_date,
        })),
      }
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `manager-report-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("[v0] Report exported successfully")
    } catch (error) {
      console.error("[v0] Error exporting report:", error)
    }
  }

  const handleTimeRangeChange = (value: string) => {
    console.log("[v0] Time range changed to:", value)
    setTimeRange(value)
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/manager">
            <Button variant="ghost" className="text-white hover:text-[#C5A572] mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                My Reports & Analytics
              </h1>
              <p className="text-sm text-slate-400">Performance insights for your projects</p>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportReport} className="bg-[#C5A572] hover:bg-[#B39562] text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <BarChart3 className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-blue-100 mt-1">
                {stats.activeProjects} active, {stats.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-green-100 mt-1">Across all active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTeamMembers}</div>
              <p className="text-xs text-purple-100 mt-1">Assigned to your projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Equipment Used</CardTitle>
              <Package className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.equipmentUsed}</div>
              <p className="text-xs text-orange-100 mt-1">Total rentals</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: "#C5A572" }} />
                Project Status Breakdown
              </CardTitle>
              <CardDescription className="text-slate-400">Distribution of project statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Active Projects</span>
                <span className="text-2xl font-bold text-green-500">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Completed Projects</span>
                <span className="text-2xl font-bold text-blue-500">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">On Hold</span>
                <span className="text-2xl font-bold text-yellow-500">{stats.onHoldProjects}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                <span className="text-sm font-medium text-slate-300">Completion Rate</span>
                <span className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                  {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: "#C5A572" }} />
                Budget Overview
              </CardTitle>
              <CardDescription className="text-slate-400">Financial summary of your projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Total Budget</span>
                <span className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                  TSH {stats.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Active Projects Budget</span>
                <span className="text-2xl font-bold text-green-500">
                  TSH{" "}
                  {projects
                    .filter((p) => p.status === "in_progress")
                    .reduce((sum, p) => sum + (p.budget || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Avg Project Budget</span>
                <span className="text-2xl font-bold text-blue-500">
                  TSH{" "}
                  {stats.totalProjects > 0 ? Math.round(stats.totalBudget / stats.totalProjects).toLocaleString() : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: "#C5A572" }} />
                Communication Activity
              </CardTitle>
              <CardDescription className="text-slate-400">Updates and client interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Project Updates</span>
                <span className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                  {stats.totalUpdates}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Client Comments</span>
                <span className="text-2xl font-bold text-blue-500">{stats.totalComments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Avg Updates/Project</span>
                <span className="text-2xl font-bold text-green-500">
                  {stats.totalProjects > 0 ? (stats.totalUpdates / stats.totalProjects).toFixed(1) : 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: "#C5A572" }} />
                Resource Utilization
              </CardTitle>
              <CardDescription className="text-slate-400">Team and equipment allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Team Members</span>
                <span className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                  {stats.totalTeamMembers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Equipment Rentals</span>
                <span className="text-2xl font-bold text-blue-500">{stats.equipmentUsed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Avg Team Size</span>
                <span className="text-2xl font-bold text-green-500">
                  {stats.totalProjects > 0 ? (stats.totalTeamMembers / stats.totalProjects).toFixed(1) : 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Summary */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#C5A572" }} />
              Recent Projects
            </CardTitle>
            <CardDescription className="text-slate-400">Latest project activity</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No projects found</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-slate-400">Budget: TSH {project.budget?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="text-sm font-medium text-white capitalize">{project.status.replace("_", " ")}</p>
                      </div>
                      <Link href={`/manager/projects/${project.id}`}>
                        <Button size="sm" className="bg-[#C5A572] hover:bg-[#B39562] text-white">
                          View
                        </Button>
                      </Link>
                    </div>
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
