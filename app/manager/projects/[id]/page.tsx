"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Send, FileText, ImageIcon, File } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  client: { full_name: string; email: string } | null
}

type Update = {
  id: string
  update_text: string
  progress_percentage: number
  created_at: string
  created_by: { full_name: string } | null
}

type Comment = {
  id: string
  comment_text: string
  created_at: string
  created_by: { full_name: string; role: string } | null
}

type ProjectFile = {
  id: string
  file_url: string
  file_type: string
  file_name: string
  created_at: string
  uploaded_by: { full_name: string } | null
}

export default function ManagerProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)

  const [newUpdate, setNewUpdate] = useState("")
  const [newProgress, setNewProgress] = useState("")
  const [newComment, setNewComment] = useState("")
  const [uploading, setUploading] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (projectId) {
      fetchProjectData()

      const updatesChannel = supabase
        .channel(`project-updates-${projectId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "project_updates",
            filter: `project_id=eq.${projectId}`,
          },
          () => {
            console.log("[v0] Real-time update received for project updates")
            fetchProjectData()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "project_comments",
            filter: `project_id=eq.${projectId}`,
          },
          () => {
            console.log("[v0] Real-time update received for project comments")
            fetchProjectData()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "project_files",
            filter: `project_id=eq.${projectId}`,
          },
          () => {
            console.log("[v0] Real-time update received for project files")
            fetchProjectData()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(updatesChannel)
      }
    }
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, updatesRes, commentsRes, filesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*, client:users!projects_client_id_fkey(full_name, email)")
          .eq("id", projectId)
          .single(),
        supabase
          .from("project_updates")
          .select("*, created_by:users(full_name)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_comments")
          .select("*, created_by:users(full_name, role)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true }),
        supabase
          .from("project_files")
          .select("*, uploaded_by:users(full_name)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ])

      if (projectRes.error) throw projectRes.error
      if (updatesRes.error) throw updatesRes.error
      if (commentsRes.error) throw commentsRes.error
      if (filesRes.error) throw filesRes.error

      setProject(projectRes.data)
      setUpdates(updatesRes.data || [])
      setComments(commentsRes.data || [])
      setFiles(filesRes.data || [])
    } catch (error: any) {
      console.error("Error fetching project data:", error.message)
      alert("Failed to load project data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !newProgress) return

    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_text: newUpdate,
          progress_percentage: Number.parseInt(newProgress),
        }),
      })

      if (!response.ok) throw new Error("Failed to add update")

      setNewUpdate("")
      setNewProgress("")
      fetchProjectData()
    } catch (error: any) {
      console.error("Error adding update:", error.message)
      alert("Failed to add update")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: newComment }),
      })

      if (!response.ok) throw new Error("Failed to add comment")

      setNewComment("")
      fetchProjectData()
    } catch (error: any) {
      console.error("Error adding comment:", error.message)
      alert("Failed to add comment")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Only images (JPG, PNG), PDFs, and Excel files are allowed")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      )

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload file to storage")
      }

      const cloudinaryData = await cloudinaryResponse.json()

      // Determine file type category
      let fileType = "image"
      if (file.type === "application/pdf") {
        fileType = "pdf"
      } else if (
        file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        fileType = "excel"
      }

      // Send the file metadata to our API as JSON
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_url: cloudinaryData.secure_url,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save file")
      }

      // Reset the file input
      e.target.value = ""
      fetchProjectData()
    } catch (error: any) {
      console.error("[v0] Error uploading file:", error.message)
      alert(`Failed to upload file: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (fileType === "application/pdf") return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const latestProgress = updates[0]?.progress_percentage || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="outline" onClick={() => router.push("/manager/projects")} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client:</span>
                  <p className="font-medium">{project.client?.full_name || "No client assigned"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>
                    <Badge>{project.status}</Badge>
                  </p>
                </div>
                {project.start_date && (
                  <div>
                    <span className="text-muted-foreground">Start Date:</span>
                    <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {project.budget && (
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">${project.budget.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Project Progress</span>
                  <span className="text-sm text-muted-foreground">{latestProgress}%</span>
                </div>
                <Progress value={latestProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Weekly Update</CardTitle>
              <CardDescription>Share progress with the client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Update Description</Label>
                <Textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Describe the work completed this week..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Progress Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  placeholder="75"
                />
              </div>
              <Button onClick={handleAddUpdate} className="w-full bg-[#C5A572] hover:bg-[#B39562]">
                <Send className="w-4 h-4 mr-2" />
                Post Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Updates</CardTitle>
              <CardDescription>Timeline of project progress</CardDescription>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-[#C5A572] pl-4 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{update.created_by?.full_name || "Unknown User"}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{update.update_text}</p>
                      <Badge variant="outline">Progress: {update.progress_percentage}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments & Discussion</CardTitle>
              <CardDescription>Communicate with the client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.created_by?.role === "client" ? "bg-muted" : "bg-[#C5A572]/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{comment.created_by?.full_name || "Unknown User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.comment_text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddComment} size="icon" className="bg-[#C5A572] hover:bg-[#B39562]">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Photos, PDFs, Excel (Max 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#C5A572] transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF, Excel</p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/jpeg,image/png,image/jpg,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
              {uploading && <p className="text-sm text-center mt-2">Uploading...</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">No files uploaded</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                    >
                      {getFileIcon(file.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {file.uploaded_by?.full_name || "Unknown"} on{" "}
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
