"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Calendar, DollarSign, FolderOpen, Package } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ClientInvoicesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (user) {
      fetchInvoices()
    }
  }, [user, loading, router])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          project:projects(id, name),
          rental:rentals(id, equipment:equipment(name))
        `)
        .eq("client_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleDownloadPDF = async (invoice: any) => {
    if (invoice.pdf_url) {
      let downloadUrl = invoice.pdf_url

      // If it's a Cloudinary URL, add the fl_attachment transformation
      if (downloadUrl.includes("cloudinary.com")) {
        downloadUrl = downloadUrl.replace("/upload/", "/upload/fl_attachment/")
      }

      // Try to open the PDF
      const newWindow = window.open(downloadUrl, "_blank")

      // If the direct URL fails (401 error), try getting a signed URL
      if (!newWindow) {
        try {
          const response = await fetch("/api/cloudinary/sign-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicId: invoice.pdf_url.split("/upload/")[1]?.replace(/^v\d+\//, ""),
            }),
          })

          if (response.ok) {
            const { signedUrl } = await response.json()
            window.open(signedUrl, "_blank")
          } else {
            alert("Unable to download PDF. Please contact support.")
          }
        } catch (error) {
          console.error("[v0] Error getting signed URL:", error)
          alert("Unable to download PDF. Please contact support.")
        }
      }
    } else {
      alert("No PDF available for this invoice")
    }
  }

  if (loading || loadingInvoices) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
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
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: "#C5A572" }}>
            My Invoices
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-slate-400">View and download your invoices</p>
        </div>

        {invoices.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: "#C5A572" }} />
              <h3 className="text-xl font-semibold text-white mb-2">No Invoices Yet</h3>
              <p className="text-slate-400">Your invoices will appear here once generated.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white">Invoice #{invoice.invoice_number}</CardTitle>
                      <CardDescription className="text-slate-400 mt-1">{invoice.description}</CardDescription>

                      {invoice.project && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <FolderOpen className="w-4 h-4 text-[#C5A572]" />
                          <span className="text-slate-300">
                            Invoice for Project:{" "}
                            <Link
                              href={`/dashboard/projects/${invoice.project.id}`}
                              className="text-[#C5A572] hover:underline"
                            >
                              {invoice.project.name}
                            </Link>
                          </span>
                        </div>
                      )}

                      {invoice.rental && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Package className="w-4 h-4 text-[#C5A572]" />
                          <span className="text-slate-300">
                            Invoice for Equipment Rental: {invoice.rental.equipment?.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-400">Issue Date</p>
                      <p className="text-white flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Due Date</p>
                      <p className="text-white flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Amount</p>
                      <p className="text-white flex items-center mt-1 font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {invoice.amount?.toLocaleString()} TSH
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-[#C5A572] hover:bg-[#B39562]"
                      onClick={() => handleDownloadPDF(invoice)}
                      disabled={!invoice.pdf_url}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {invoice.pdf_url ? "Download PDF" : "No PDF Available"}
                    </Button>
                    {invoice.status === "pending" && (
                      <Button
                        variant="outline"
                        className="border-slate-600 text-white bg-transparent hover:bg-slate-700"
                      >
                        Pay Now
                      </Button>
                    )}
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
