"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Mail, User, Briefcase } from "lucide-react"
import Link from "next/link"

type TeamMember = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

type Project = {
  id: string
  name: string
  status: string
}

type ProjectAssignment = {
  id: string
  user_id: string
  project_id: string
  project: Project
}

export default function ManagerTeamPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "client",
  })

  const [assignmentData, setAssignmentData] = useState({
    user_id: "",
    project_id: "",
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && (!user || userRole !== "project_manager")) {
      router.push("/login")
    }
    if (user && userRole === "project_manager") {
      fetchTeamMembers()
      fetchProjects()
      fetchAssignments()
    }
  }, [user, userRole, loading, router])

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("role", ["client", "project_manager"])
        .order("created_at", { ascending: false })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error: any) {
      console.error("Error fetching team members:", error.message)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status")
        .in("status", ["planning", "in_progress"])

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error("Error fetching projects:", error.message)
    }
  }

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("project_assignments")
        .select(
          `
          *,
          project:projects(id, name, status)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (error: any) {
      console.error("Error fetching assignments:", error.message)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add team member")
      }

      setIsAddDialogOpen(false)
      setFormData({ full_name: "", email: "", role: "client" })
      fetchTeamMembers()
      alert("Team member added successfully! They will receive an email to set their password.")
    } catch (error: any) {
      console.error("Error adding team member:", error.message)
      alert("Failed to add team member: " + error.message)
    }
  }

  const handleAssignToProject = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await supabase.from("project_assignments").insert([
        {
          user_id: assignmentData.user_id,
          project_id: assignmentData.project_id,
        },
      ])

      if (error) throw error

      setIsAssignDialogOpen(false)
      setAssignmentData({ user_id: "", project_id: "" })
      fetchAssignments()
      alert("Team member assigned to project successfully!")
    } catch (error: any) {
      console.error("Error assigning to project:", error.message)
      alert("Failed to assign to project: " + error.message)
    }
  }

  const openAssignDialog = (member: TeamMember) => {
    setSelectedMember(member)
    setAssignmentData({ ...assignmentData, user_id: member.id })
    setIsAssignDialogOpen(true)
  }

  const getMemberProjects = (memberId: string) => {
    return assignments.filter((a) => a.user_id === memberId).map((a) => a.project)
  }

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading || loadingData) {
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              Team Management
            </h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C5A572] hover:bg-[#B39562]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>Create a new team member account</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                    Add Team Member
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => {
            const memberProjects = getMemberProjects(member.id)
            return (
              <Card key={member.id} className="bg-white border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#C5A572]/10 flex items-center justify-center">
                        <User className="w-6 h-6" style={{ color: "#C5A572" }} />
                      </div>
                      <div>
                        <CardTitle className="text-slate-900 text-lg">{member.full_name}</CardTitle>
                        <Badge variant="outline" className="mt-1 bg-white border-slate-300 text-slate-700">
                          {member.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {memberProjects.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Assigned Projects ({memberProjects.length})
                      </p>
                      <div className="space-y-1">
                        {memberProjects.slice(0, 2).map((project) => (
                          <p key={project.id} className="text-sm text-slate-900 truncate">
                            • {project.name}
                          </p>
                        ))}
                        {memberProjects.length > 2 && (
                          <p className="text-sm text-slate-600">+{memberProjects.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => openAssignDialog(member)}
                    variant="outline"
                    className="w-full border-[#C5A572] text-[#C5A572] hover:bg-[#C5A572] hover:text-white"
                  >
                    Assign to Project
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No team members found</p>
          </div>
        )}
      </main>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Project</DialogTitle>
            <DialogDescription>Assign {selectedMember?.full_name} to a project</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignToProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Select Project *</Label>
              <Select
                value={assignmentData.project_id}
                onValueChange={(value) => setAssignmentData({ ...assignmentData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-[#C5A572] hover:bg-[#B39562]">
              Assign to Project
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
