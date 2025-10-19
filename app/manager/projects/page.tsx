"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ManagerProjectsPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && (!user || userRole !== "project_manager")) {
      router.push("/login")
    }
    fetchProjects()
  }, [user, userRole, loading, router])

  const fetchProjects = async () => {
    if (user && userRole === "project_manager") {
      const { data, error } = await supabase.from("projects").select("*").eq("manager_id", user.id)
      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        setProjects(data || [])
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600"
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
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button asChild variant="ghost" className="text-white hover:text-[#C5A572] mb-4">
            <Link href="/manager">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              My Projects
            </h1>
            <Button className="bg-[#C5A572] hover:bg-[#B39562]">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
              <p className="text-slate-400 mb-6">Create your first project to get started.</p>
              <Button className="bg-[#C5A572] hover:bg-[#B39562]">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{project.name}</CardTitle>
                      <CardDescription className="text-slate-400">{project.client_name}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 mb-4">{project.description}</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Start Date</p>
                        <p className="text-white flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {project.start_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">End Date</p>
                        <p className="text-white flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          {project.end_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Team Size</p>
                        <p className="text-white flex items-center mt-1">
                          <Users className="w-4 h-4 mr-2" />
                          {project.team_size} members
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild className="bg-[#C5A572] hover:bg-[#B39562]">
                      <Link href={`/manager/projects/${project.id}`}>View Details</Link>
                    </Button>
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
