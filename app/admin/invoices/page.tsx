"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AdminInvoicesPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: "",
    project_id: "",
    amount: "",
    due_date: "",
    description: "",
    status: "pending",
  })

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/login")
    }
    if (user && userRole === "admin") {
      fetchInvoices()
      fetchProjects()
    }
  }, [user, userRole, loading, router])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const result = await response.json()
        setProjects(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoiceForm,
          amount: Number.parseFloat(invoiceForm.amount),
          invoice_number: `INV-${Date.now()}`,
        }),
      })

      if (!response.ok) throw new Error("Failed to create invoice")

      setIsCreateDialogOpen(false)
      setInvoiceForm({
        client_id: "",
        project_id: "",
        amount: "",
        due_date: "",
        description: "",
        status: "pending",
      })
      fetchInvoices()
      alert("Invoice created successfully!")
    } catch (error: any) {
      console.error("Error creating invoice:", error)
      alert("Failed to create invoice: " + error.message)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const result = await response.json()
        setInvoices(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      setInvoices([])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-600"
      case "pending":
        return "bg-yellow-600"
      case "overdue":
        return "bg-red-600"
      default:
        return "bg-slate-600"
    }
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
            <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
              Invoice Management
            </h1>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#C5A572] hover:bg-[#B39562]">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
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
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        {invoices.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">No Invoices Found</h3>
              <p className="text-slate-400 mb-6">Create your first invoice to get started.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#C5A572] hover:bg-[#B39562]">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="bg-slate-800 border-slate-700">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-white font-semibold">Invoice #{invoice.invoice_number}</h3>
                          <p className="text-sm text-slate-400">{invoice.client_name}</p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Amount</p>
                        <p className="text-white font-semibold">${invoice.amount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-white bg-transparent">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-white bg-transparent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-2">
                <Label>Link to Project (Optional)</Label>
                <Select
                  value={invoiceForm.project_id}
                  onValueChange={(value) => setInvoiceForm({ ...invoiceForm, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} - {project.client?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (TSH)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  placeholder="Invoice details..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#C5A572] hover:bg-[#B39562]">
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
