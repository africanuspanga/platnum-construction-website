"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface Equipment {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  daily_rate: number
  status: "available" | "rented" | "maintenance" | "retired"
  created_at: string
  updated_at: string
}

export default function AdminEquipmentPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image_url: "",
    daily_rate: "",
    status: "available" as Equipment["status"],
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/login")
      return
    }
    if (user && userRole === "admin") {
      fetchEquipment()
    }
  }, [user, userRole, loading, router])

  const fetchEquipment = async () => {
    try {
      setIsFetching(true)
      console.log("[v0] Fetching equipment...")
      const { data, error } = await supabase.from("equipment").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching equipment:", error)
        throw error
      }

      console.log("[v0] Equipment fetched:", data)
      setEquipment(data || [])
    } catch (error: any) {
      console.error("[v0] Error fetching equipment:", error.message)
      alert("Failed to fetch equipment. Please try again.")
    } finally {
      setIsFetching(false)
    }
  }

  const handleAddEquipment = async () => {
    if (!formData.name || !formData.category || !formData.daily_rate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      console.log("[v0] Adding equipment:", formData)

      const { data, error } = await supabase
        .from("equipment")
        .insert([
          {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            image_url: formData.image_url,
            daily_rate: Number.parseFloat(formData.daily_rate),
            status: formData.status,
            created_by: user?.id,
          },
        ])
        .select()

      if (error) {
        console.error("[v0] Error adding equipment:", error)
        throw error
      }

      console.log("[v0] Equipment added successfully:", data)
      await fetchEquipment()
      setIsAddModalOpen(false)
      resetForm()
      alert("Equipment added successfully!")
    } catch (error: any) {
      console.error("[v0] Error adding equipment:", error.message)
      alert(`Failed to add equipment: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEquipment = async () => {
    if (!selectedEquipment || !formData.name || !formData.category || !formData.daily_rate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      console.log("[v0] Updating equipment:", selectedEquipment.id, formData)

      const { error } = await supabase
        .from("equipment")
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          image_url: formData.image_url,
          daily_rate: Number.parseFloat(formData.daily_rate),
          status: formData.status,
        })
        .eq("id", selectedEquipment.id)

      if (error) {
        console.error("[v0] Error updating equipment:", error)
        throw error
      }

      console.log("[v0] Equipment updated successfully")
      await fetchEquipment()
      setIsEditModalOpen(false)
      setSelectedEquipment(null)
      resetForm()
      alert("Equipment updated successfully!")
    } catch (error: any) {
      console.error("[v0] Error updating equipment:", error.message)
      alert(`Failed to update equipment: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return

    try {
      setIsLoading(true)
      console.log("[v0] Deleting equipment:", selectedEquipment.id)

      const { error } = await supabase.from("equipment").delete().eq("id", selectedEquipment.id)

      if (error) {
        console.error("[v0] Error deleting equipment:", error)
        throw error
      }

      console.log("[v0] Equipment deleted successfully")
      await fetchEquipment()
      setIsDeleteModalOpen(false)
      setSelectedEquipment(null)
      alert("Equipment deleted successfully!")
    } catch (error: any) {
      console.error("[v0] Error deleting equipment:", error.message)
      alert(`Failed to delete equipment: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (item: Equipment) => {
    setSelectedEquipment(item)
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || "",
      image_url: item.image_url || "",
      daily_rate: item.daily_rate.toString(),
      status: item.status,
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      image_url: "",
      daily_rate: "",
      status: "available",
    })
  }

  const filteredEquipment = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: Equipment["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-600"
      case "rented":
        return "bg-blue-600"
      case "maintenance":
        return "bg-yellow-600"
      case "retired":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C5A572] animate-spin" />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              Equipment Management
            </h1>
            <Button
              onClick={() => {
                resetForm()
                setIsAddModalOpen(true)
              }}
              className="bg-[#C5A572] hover:bg-[#B39562]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search equipment by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {filteredEquipment.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? "No Equipment Found" : "No Equipment Yet"}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery ? "Try adjusting your search query." : "Add equipment to start managing your inventory."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => {
                    resetForm()
                    setIsAddModalOpen(true)
                  }}
                  className="bg-[#C5A572] hover:bg-[#B39562]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                {item.image_url && (
                  <div className="aspect-video bg-slate-700 overflow-hidden">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg leading-tight">{item.name}</CardTitle>
                      <p className="text-slate-400 text-sm mt-1">{item.category}</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>}
                  <div className="mb-4">
                    <p className="text-[#C5A572] font-bold text-lg">TSH {item.daily_rate.toLocaleString()}/day</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEditModal(item)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteModal(item)}
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Equipment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#C5A572]">Add New Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Caterpillar Excavator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="Excavators">Excavators</SelectItem>
                    <SelectItem value="Bulldozers">Bulldozers</SelectItem>
                    <SelectItem value="Graders">Graders</SelectItem>
                    <SelectItem value="Loaders">Loaders</SelectItem>
                    <SelectItem value="Dump Trucks">Dump Trucks</SelectItem>
                    <SelectItem value="Cranes">Cranes</SelectItem>
                    <SelectItem value="Concrete Equipment">Concrete Equipment</SelectItem>
                    <SelectItem value="Trucks">Trucks</SelectItem>
                    <SelectItem value="Trailers">Trailers</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Brief description of the equipment..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (Cloudinary)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="https://res.cloudinary.com/..."
              />
              <p className="text-xs text-slate-400">Paste the Cloudinary URL for the equipment image</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Daily Rate (TSH) *</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., 800000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Equipment["status"]) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleAddEquipment} disabled={isLoading} className="bg-[#C5A572] hover:bg-[#B39562]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Equipment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#C5A572]">Edit Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Equipment Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="Excavators">Excavators</SelectItem>
                    <SelectItem value="Bulldozers">Bulldozers</SelectItem>
                    <SelectItem value="Graders">Graders</SelectItem>
                    <SelectItem value="Loaders">Loaders</SelectItem>
                    <SelectItem value="Dump Trucks">Dump Trucks</SelectItem>
                    <SelectItem value="Cranes">Cranes</SelectItem>
                    <SelectItem value="Concrete Equipment">Concrete Equipment</SelectItem>
                    <SelectItem value="Trucks">Trucks</SelectItem>
                    <SelectItem value="Trailers">Trailers</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL (Cloudinary)</Label>
              <Input
                id="edit-image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-daily_rate">Daily Rate (TSH) *</Label>
                <Input
                  id="edit-daily_rate"
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Equipment["status"]) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleEditEquipment} disabled={isLoading} className="bg-[#C5A572] hover:bg-[#B39562]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Equipment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Equipment</DialogTitle>
          </DialogHeader>
          <p className="text-slate-300">
            Are you sure you want to delete <span className="font-bold">{selectedEquipment?.name}</span>? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteEquipment} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
