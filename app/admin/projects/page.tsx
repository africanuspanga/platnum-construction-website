"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, User, Building, ArrowLeft } from "lucide-react"
import { useUser } from "@/context/user-context"
import Link from "next/link"

type Project = {
  id: string
  name: string
  description: string | null
  client_id: string
  manager_id: string | null
  status: "planning" | "in_progress" | "completed" | "on_hold"
  start_date: string | null
  end_date: string | null
  budget: number | null
  created_at: string
  approved_at?: string
  approved_by?: string
  client?: { full_name: string; email: string }
  manager?: { full_name: string; email: string }
}

type ProjectUser = {
  id: string
  full_name: string
  email: string
  role: string
}

type FormData = {
  name: string
  description: string
  client_id: string
  manager_id: string
  status: "planning" | "in_progress" | "completed" | "on_hold"
  start_date: string
  end_date: string
  budget: string
}

const ProjectForm = ({
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
  clients,
  managers,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onSubmit: (e: React.FormEvent) => void
  isEdit?: boolean
  clients: ProjectUser[]
  managers: ProjectUser[]
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Project Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        required
        placeholder="New Office Building"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="Project details and requirements..."
        rows={3}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="client">Client *</Label>
        <Select
          value={formData.client_id}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, client_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manager">Project Manager</Label>
        <Select
          value={formData.manager_id}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, manager_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget ($)</Label>
        <Input
          id="budget"
          type="number"
          step="0.01"
          value={formData.budget}
          onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
          placeholder="50000.00"
        />
      </div>
    </div>

    <Button type="submit" className="w-full bg-[#C5A572] hover:bg-[#B39562]">
      {isEdit ? "Update Project" : "Create Project"}
    </Button>
  </form>
)

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<ProjectUser[]>([])
  const [managers, setManagers] = useState<ProjectUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState<Project | null>(null)
  const [selectedManagerId, setSelectedManagerId] = useState("")
  const { user } = useUser()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    client_id: "",
    manager_id: "",
    status: "planning",
    start_date: "",
    end_date: "",
    budget: "",
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          client:users!projects_client_id_fkey(full_name, email),
          manager:users!projects_manager_id_fkey(full_name, email)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error("Error fetching projects:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("id, full_name, email, role")

      if (error) throw error

      const allUsers = data || []
      setClients(allUsers.filter((u) => u.role === "client"))
      setManagers(allUsers.filter((u) => u.role === "project_manager"))
    } catch (error: any) {
      console.error("Error fetching users:", error.message)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("projects").insert([
        {
          name: formData.name,
          description: formData.description || null,
          client_id: formData.client_id,
          manager_id: formData.manager_id || null,
          status: formData.status,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? Number.parseFloat(formData.budget) : null,
        },
      ])

      if (error) throw error

      setIsAddDialogOpen(false)
      resetForm()
      fetchProjects()
    } catch (error: any) {
      console.error("Error adding project:", error.message)
      alert("Failed to add project: " + error.message)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name,
          description: formData.description || null,
          client_id: formData.client_id,
          manager_id: formData.manager_id || null,
          status: formData.status,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          budget: formData.budget ? Number.parseFloat(formData.budget) : null,
        })
        .eq("id", selectedProject.id)

      if (error) throw error

      setIsEditDialogOpen(false)
      setSelectedProject(null)
      resetForm()
      fetchProjects()
    } catch (error: any) {
      console.error("Error updating project:", error.message)
      alert("Failed to update project: " + error.message)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) throw error
      fetchProjects()
    } catch (error: any) {
      console.error("Error deleting project:", error.message)
      alert("Failed to delete project: " + error.message)
    }
  }

  const handleApproveAndAssign = async () => {
    if (!selectedProjectForAssignment || !selectedManagerId) return

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          manager_id: selectedManagerId,
          status: "in_progress",
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", selectedProjectForAssignment.id)

      if (error) throw error

      // Send notification email
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedProjectForAssignment.client?.email,
          subject: "Project Approved - Platnum Construction",
          html: `<p>Your project "${selectedProjectForAssignment.name}" has been approved and assigned to a project manager.</p>`,
        }),
      })

      setIsAssignDialogOpen(false)
      setSelectedProjectForAssignment(null)
      setSelectedManagerId("")
      fetchProjects()
      alert("Project approved and assigned successfully!")
    } catch (error: any) {
      console.error("Error approving project:", error.message)
      alert("Failed to approve project: " + error.message)
    }
  }

  const openEditDialog = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      client_id: project.client_id,
      manager_id: project.manager_id || "",
      status: project.status,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      budget: project.budget?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const openAssignDialog = (project: Project) => {
    setSelectedProjectForAssignment(project)
    setIsAssignDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      client_id: "",
      manager_id: "",
      status: "planning",
      start_date: "",
      end_date: "",
      budget: "",
    })
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "planning":
        return "bg-blue-500"
      case "in_progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "on_hold":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-lg text-white">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center gap-4 mb-4">
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
        >
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Management</h1>
          <p className="text-slate-400">Manage all construction projects</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#C5A572] hover:bg-[#B39562]">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Project</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new construction project to the system
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddProject}
              clients={clients}
              managers={managers}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-white">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex gap-2">
                  {/* Approve & Assign Button */}
                  {project.status === "planning" && !project.manager_id && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openAssignDialog(project)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve & Assign
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(project)}
                    className="text-slate-300 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id)}
                    className="hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && (
                <CardDescription className="line-clamp-2 text-slate-300">{project.description}</CardDescription>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Client:</span>
                  <span className="font-medium text-white">{project.client?.full_name || "N/A"}</span>
                </div>

                {project.manager && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Manager:</span>
                    <span className="font-medium text-white">{project.manager.full_name}</span>
                  </div>
                )}

                {project.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-medium text-white">${project.budget.toLocaleString()}</span>
                  </div>
                )}

                {project.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Start:</span>
                    <span className="font-medium text-white">{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No projects found</p>
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Approve & Assign Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Assign a project manager to: {selectedProjectForAssignment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Select Project Manager</Label>
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveAndAssign}
                disabled={!selectedManagerId}
                className="flex-1 bg-[#C5A572] hover:bg-[#B39562]"
              >
                Approve & Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Project</DialogTitle>
            <DialogDescription className="text-slate-400">Update project information</DialogDescription>
          </DialogHeader>
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditProject}
            isEdit
            clients={clients}
            managers={managers}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
