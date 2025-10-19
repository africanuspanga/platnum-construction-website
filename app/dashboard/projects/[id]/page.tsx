"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Send, FileText, ImageIcon, File } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  manager: { full_name: string; email: string } | null
}

type Update = {
  id: string
  update_text: string
  progress_percentage: number
  created_at: string
  created_by: { full_name: string }
}

type Comment = {
  id: string
  comment_text: string
  created_at: string
  created_by: { full_name: string; role: string }
}

type ProjectFile = {
  id: string
  file_url: string
  file_type: string
  file_name: string
  created_at: string
  uploaded_by: { full_name: string }
}

export default function ClientProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")

  const supabase = createBrowserClient()

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, updatesRes, commentsRes, filesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*, manager:users!projects_manager_id_fkey(full_name, email)")
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
      <Button variant="outline" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
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
                {project.manager && (
                  <div>
                    <span className="text-muted-foreground">Project Manager:</span>
                    <p className="font-medium">{project.manager.full_name}</p>
                  </div>
                )}
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
              <CardTitle>Project Updates</CardTitle>
              <CardDescription>Weekly progress from your project manager</CardDescription>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No updates yet</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-[#C5A572] pl-4 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{update.created_by.full_name}</span>
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
              <CardTitle>Comments & Questions</CardTitle>
              <CardDescription>Communicate with your project manager</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg ${
                      comment.created_by.role === "client" ? "bg-[#C5A572]/10" : "bg-muted"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{comment.created_by.full_name}</span>
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
                  placeholder="Ask a question or leave a comment..."
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
              <CardTitle>Project Files</CardTitle>
              <CardDescription>Photos and documents</CardDescription>
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
