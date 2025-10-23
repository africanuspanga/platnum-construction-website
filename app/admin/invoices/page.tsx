"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminInvoicesPage() {
  const router = useRouter()
  const { user, userRole, loading } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const hasFetchedData = useRef(false)
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: "",
    project_id: "",
    amount: "",
    due_date: "",
    description: "",
    status: "pending",
    invoice_type: "manual", // "manual" or "project"
    pdf_file: null as File | null,
  })

  useEffect(() => {
    if (!loading && (!user || userRole !== "admin")) {
      router.push("/login")
      return
    }
    if (user && userRole === "admin" && !hasFetchedData.current) {
      hasFetchedData.current = true
      fetchInvoices()
      fetchProjects()
      fetchClients()
    }
  }, [user, userRole, loading])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/users?role=client")
      if (response.ok) {
        const result = await response.json()
        setClients(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setInvoiceForm((prev) => ({ ...prev, pdf_file: file }))
    } else {
      alert("Please select a PDF file")
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceForm.client_id) {
      alert("Please select a client")
      return
    }

    if (!invoiceForm.amount || Number.parseFloat(invoiceForm.amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!invoiceForm.due_date) {
      alert("Please select a due date")
      return
    }

    setIsUploading(true)

    try {
      let pdfUrl = null

      if (invoiceForm.pdf_file) {
        const formData = new FormData()
        formData.append("file", invoiceForm.pdf_file)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

        console.log("[v0] Uploading PDF to Cloudinary...")
        console.log("[v0] Cloud name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
        console.log("[v0] Upload preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        console.log("[v0] Cloudinary response status:", cloudinaryResponse.status)

        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text()
          console.error("[v0] Cloudinary error response:", errorText)
          throw new Error(`Failed to upload PDF: ${errorText}`)
        }

        const cloudinaryData = await cloudinaryResponse.json()
        console.log("[v0] Cloudinary upload successful:", cloudinaryData.secure_url)
        pdfUrl = cloudinaryData.secure_url
      }

      console.log("[v0] Creating invoice with data:", {
        client_id: invoiceForm.client_id,
        project_id: invoiceForm.project_id || null,
        amount: Number.parseFloat(invoiceForm.amount),
        pdf_url: pdfUrl,
      })

      const invoiceData = {
        client_id: invoiceForm.client_id,
        project_id: invoiceForm.project_id || null,
        amount: Number.parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date,
        notes: invoiceForm.description,
        status: invoiceForm.status,
        pdf_url: pdfUrl,
        invoice_type: invoiceForm.invoice_type,
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create invoice")
      }

      console.log("[v0] Invoice created successfully")
      setIsCreateDialogOpen(false)
      setInvoiceForm({
        client_id: "",
        project_id: "",
        amount: "",
        due_date: "",
        description: "",
        status: "pending",
        invoice_type: "manual",
        pdf_file: null,
      })
      fetchInvoices()
      alert("Invoice created successfully!")
    } catch (error: any) {
      console.error("[v0] Error creating invoice:", error)
      alert("Failed to create invoice: " + error.message)
    } finally {
      setIsUploading(false)
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

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

        {filteredInvoices.length === 0 ? (
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
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="bg-slate-800 border-slate-700">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            Invoice #{invoice.invoice_number}
                            {invoice.pdf_url && <FileText className="w-4 h-4 text-[#C5A572]" />}
                          </h3>
                          <p className="text-sm text-slate-400">{invoice.client?.full_name || "Unknown Client"}</p>
                          {invoice.project && <p className="text-xs text-slate-500">Project: {invoice.project.name}</p>}
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Amount</p>
                        <p className="text-white font-semibold">TSH {invoice.amount?.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {invoice.pdf_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
                            onClick={() => window.open(invoice.pdf_url, "_blank")}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="manual"
                  onClick={() => setInvoiceForm((prev) => ({ ...prev, invoice_type: "manual" }))}
                >
                  Manual Invoice
                </TabsTrigger>
                <TabsTrigger
                  value="project"
                  onClick={() => setInvoiceForm((prev) => ({ ...prev, invoice_type: "project" }))}
                >
                  Project Invoice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select
                      value={invoiceForm.client_id}
                      onValueChange={(value) => setInvoiceForm((prev) => ({ ...prev, client_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {clients.length === 0 ? (
                          <div className="p-2 text-sm text-slate-400">No clients found</div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name} {client.email ? `(${client.email})` : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {clients.length === 0 && <p className="text-xs text-slate-400">Loading clients...</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Upload PDF Invoice (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="application/pdf" onChange={handleFileChange} className="flex-1" />
                      {invoiceForm.pdf_file && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {invoiceForm.pdf_file.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a PDF invoice for the client to view and download
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (TSH) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={invoiceForm.status}
                      onValueChange={(value) => setInvoiceForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Invoice details..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#C5A572] hover:bg-[#B39562]" disabled={isUploading}>
                      {isUploading ? "Creating..." : "Create Invoice"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="project">
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Link to Project *</Label>
                    <Select
                      value={invoiceForm.project_id}
                      onValueChange={(value) => {
                        const project = projects.find((p) => p.id === value)
                        setInvoiceForm((prev) => ({
                          ...prev,
                          project_id: value,
                          client_id: project?.client_id || "",
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {projects.length === 0 ? (
                          <div className="p-2 text-sm text-slate-400">No projects found</div>
                        ) : (
                          projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name} - {project.client?.full_name || "No client"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {projects.length === 0 && <p className="text-xs text-slate-400">Loading projects...</p>}
                  </div>

                  {invoiceForm.client_id && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md border">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Client:</p>
                      <p className="font-medium">
                        {clients.find((c) => c.id === invoiceForm.client_id)?.full_name || "Unknown"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Upload PDF Invoice (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="application/pdf" onChange={handleFileChange} className="flex-1" />
                      {invoiceForm.pdf_file && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {invoiceForm.pdf_file.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (TSH) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={invoiceForm.status}
                      onValueChange={(value) => setInvoiceForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Invoice details..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-[#C5A572] hover:bg-[#B39562]" disabled={isUploading}>
                      {isUploading ? "Creating..." : "Create Invoice"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
