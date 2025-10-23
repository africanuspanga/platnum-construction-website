"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, FileText, User, LogOut, FolderPlus, X } from "lucide-react"
import Link from "next/link"
import Badge from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ClientDashboard() {
  const router = useRouter()
  const { user, userRole, loading, signOut } = useAuth()
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    budget: "",
    currency: "TSH",
    timeline: "",
  })
  const [projectFiles, setProjectFiles] = useState<File[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const projectsFetched = useRef(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && userRole && userRole !== "client") {
      const dashboardPath = userRole === "admin" ? "/admin" : "/manager"
      router.push(dashboardPath)
    }
    if (user && !projectsFetched.current) {
      projectsFetched.current = true
      fetchProjects()

      const projectsChannel = supabase
        .channel(`client-projects-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "projects",
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            console.log("[v0] Real-time update received for client projects")
            fetchProjects()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(projectsChannel)
      }
    }
  }, [user, userRole, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setProjectFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileRemove = useCallback((index: number) => {
    setProjectFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectForm.name,
          description: projectForm.description,
          budget: Number.parseFloat(projectForm.budget),
          currency: projectForm.currency,
          start_date: new Date().toISOString().split("T")[0],
          end_date: projectForm.timeline,
          status: "pending",
          client_id: user?.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create project request")
      }

      const { data: project } = await response.json()

      if (projectFiles.length > 0 && project?.id) {
        setIsUploadingFiles(true)

        for (const file of projectFiles) {
          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

            const cloudinaryResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
              {
                method: "POST",
                body: formData,
              },
            )

            if (!cloudinaryResponse.ok) {
              throw new Error("Failed to upload file to storage")
            }

            const cloudinaryData = await cloudinaryResponse.json()

            await fetch(`/api/projects/${project.id}/files`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                file_name: file.name,
                file_url: cloudinaryData.secure_url,
                file_type: file.type,
                file_size: file.size,
              }),
            })
          } catch (fileError) {
            console.error("[v0] Error uploading file:", fileError)
          }
        }

        setIsUploadingFiles(false)
      }

      alert("Project request submitted successfully! Admin will review and assign a project manager.")
      setIsProjectModalOpen(false)
      setProjectForm({ name: "", description: "", budget: "", currency: "TSH", timeline: "" })
      setProjectFiles([])
      fetchProjects()
    } catch (error: any) {
      console.error("[v0] Error creating project:", error)
      alert(error.message || "Failed to submit project request. Please try again.")
    } finally {
      setIsSubmitting(false)
      setIsUploadingFiles(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")

      if (response.status === 429) {
        console.error("[v0] Rate limit exceeded. Please wait before retrying.")
        setProjects([])
        return
      }

      if (!response.ok) {
        console.error("[v0] Error fetching projects: HTTP", response.status)
        setProjects([])
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Error: API returned non-JSON response")
        setProjects([])
        return
      }

      const result = await response.json()

      if (result.error) {
        console.error("[v0] Error fetching projects:", result.error)
        setProjects([])
        return
      }

      if (Array.isArray(result.data)) {
        setProjects(result.data.filter((p: any) => p.client_id === user?.id))
      } else {
        console.error("[v0] Error fetching projects: data is not an array", result)
        setProjects([])
      }
    } catch (error) {
      console.error("[v0] Error fetching projects:", error)
      setProjects([])
    }
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: "#C5A572" }}>
            Client Dashboard
          </h1>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent shrink-0"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || "Client"}!
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">Manage your projects and equipment rentals</p>
          </div>
          <Button
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-[#C5A572] hover:bg-[#B39562] w-full sm:w-auto shrink-0"
            size="lg"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            <span className="truncate">Request New Project</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Package className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">Equipment Rentals</CardTitle>
              <CardDescription className="text-slate-400">View and manage your equipment rentals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/dashboard/rentals">View Rentals</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <FileText className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">Invoices</CardTitle>
              <CardDescription className="text-slate-400">Access your invoices and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/dashboard/invoices">View Invoices</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <User className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-slate-400">Update your profile and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <FolderPlus className="w-8 h-8 mb-2" style={{ color: "#C5A572" }} />
            <CardTitle className="text-white">My Projects</CardTitle>
            <CardDescription className="text-slate-400">View and track your construction projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-2 mb-4">
                {projects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block p-3 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{project.name}</span>
                      <Badge className={project.status === "in_progress" ? "bg-yellow-500" : "bg-blue-500"}>
                        {project.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm mb-4">No projects yet</p>
            )}
            <Button onClick={() => setIsProjectModalOpen(true)} className="w-full bg-[#C5A572] hover:bg-[#B39562]">
              Request New Project
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Your latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center py-8 text-sm sm:text-base">
              No recent activity. Start by renting equipment or requesting a project.
            </p>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Request New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-white">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="e.g., Office Building Construction"
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe your project requirements..."
                required
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-budget" className="text-white">
                  Estimated Budget
                </Label>
                <Input
                  id="project-budget"
                  type="text"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="e.g., 50000000"
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-currency" className="text-white">
                  Currency
                </Label>
                <Select
                  value={projectForm.currency}
                  onValueChange={(value) => setProjectForm({ ...projectForm, currency: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="TSH" className="text-white hover:bg-slate-600">
                      TSH (Tanzanian Shilling)
                    </SelectItem>
                    <SelectItem value="USD" className="text-white hover:bg-slate-600">
                      USD (US Dollar)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-timeline" className="text-white">
                Expected Completion
              </Label>
              <Input
                id="project-timeline"
                type="date"
                value={projectForm.timeline}
                onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-files" className="text-white">
                Attachments (Optional)
              </Label>
              <div className="space-y-2">
                <Input
                  id="project-files"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="bg-slate-700 border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#C5A572] file:text-white hover:file:bg-[#B39562]"
                />
                {projectFiles.length > 0 && (
                  <div className="space-y-1">
                    {projectFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-700 p-2 rounded text-sm">
                        <span className="truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileRemove(index)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProjectModalOpen(false)}
                className="flex-1 border-[#C5A572] text-[#C5A572] hover:bg-[#C5A572] hover:text-white"
                disabled={isSubmitting || isUploadingFiles}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingFiles}
                className="flex-1 bg-[#C5A572] hover:bg-[#B39562]"
              >
                {isSubmitting ? "Submitting..." : isUploadingFiles ? "Uploading files..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
