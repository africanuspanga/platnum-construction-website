"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Search, Edit, Trash2, Mail, Phone, Building2, User } from "lucide-react"
import Link from "next/link"

interface UserData {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: "client" | "project_manager" | "admin"
  company_name: string | null
  avatar_url: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/login")
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    if (user && userRole === "admin") {
      fetchUsers()
    }
  }, [user, userRole])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, users])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error

      console.log("[v0] Fetched users:", data)
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.company_name?.toLowerCase().includes(query),
      )
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: UserData) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: editingUser.full_name,
          phone: editingUser.phone,
          role: editingUser.role,
          company_name: editingUser.company_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id)

      if (error) throw error

      console.log("[v0] User updated successfully")
      setIsEditDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      alert("Failed to update user. Please try again.")
    }
  }

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", userToDelete.id)

      if (error) throw error

      console.log("[v0] User deleted successfully")
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      alert("Failed to delete user. Please try again.")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[#C5A572] text-white"
      case "project_manager":
        return "bg-[#1E3A5F] text-white"
      case "client":
        return "bg-slate-600 text-white"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "project_manager":
        return "Project Manager"
      case "client":
        return "Client"
      default:
        return role
    }
  }

  if (loading || isLoading) {
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
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
                User Management
              </h1>
              <p className="text-sm text-slate-400 mt-1">Manage clients, project managers, and admin users</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-slate-700 text-white text-sm px-3 py-1">Total Users: {users.length}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="project_manager">Project Manager</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-slate-400">
                {searchQuery || roleFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Users will appear here once they register"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((userData) => (
              <Card
                key={userData.id}
                className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-semibold">{userData.full_name}</h3>
                          <Badge className={getRoleBadgeColor(userData.role)}>{getRoleLabel(userData.role)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {userData.email}
                          </div>
                          {userData.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {userData.phone}
                            </div>
                          )}
                          {userData.company_name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {userData.company_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(userData)}
                        className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(userData)}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle style={{ color: "#C5A572" }}>Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">Update user information and role</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editingUser.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-white">
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  value={editingUser.company_name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, company_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">
                  Role
                </Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-[#C5A572] hover:bg-[#B39562]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="text-white">
                <strong>{userToDelete.full_name}</strong> ({userToDelete.email})
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
