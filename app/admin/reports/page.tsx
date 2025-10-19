"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  FileText,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

type ReportStats = {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  pendingInvoices: number
  totalEquipment: number
  availableEquipment: number
  totalUsers: number
  activeRentals: number
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    totalUsers: 0,
    activeRentals: 0,
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    try {
      // Fetch projects
      const { data: projects } = await supabase.from("projects").select("status, budget")
      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter((p) => p.status === "in_progress").length || 0
      const completedProjects = projects?.filter((p) => p.status === "completed").length || 0

      // Fetch invoices
      const { data: invoices } = await supabase.from("invoices").select("total_amount, status")
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      const pendingInvoices = invoices?.filter((inv) => inv.status === "pending").length || 0

      // Fetch equipment
      const { data: equipment } = await supabase.from("equipment").select("status")
      const totalEquipment = equipment?.length || 0
      const availableEquipment = equipment?.filter((eq) => eq.status === "available").length || 0

      // Fetch users
      const { data: users } = await supabase.from("users").select("id")
      const totalUsers = users?.length || 0

      // Fetch rentals
      const { data: rentals } = await supabase.from("rentals").select("status")
      const activeRentals = rentals?.filter((r) => r.status === "active").length || 0

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue,
        pendingInvoices,
        totalEquipment,
        availableEquipment,
        totalUsers,
        activeRentals,
      })
    } catch (error: any) {
      console.error("Error fetching report data:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      stats,
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `platinum-construction-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">System-wide statistics and insights</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="bg-[#C5A572] hover:bg-[#B39562]">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BarChart3 className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-blue-100 mt-1">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-100 mt-1">{stats.pendingInvoices} pending invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipment</CardTitle>
            <Package className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEquipment}</div>
            <p className="text-xs text-purple-100 mt-1">{stats.availableEquipment} available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-orange-100 mt-1">{stats.activeRentals} active rentals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C5A572]" />
              Project Performance
            </CardTitle>
            <CardDescription>Overview of project statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Projects</span>
              <span className="text-2xl font-bold text-[#C5A572]">{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed Projects</span>
              <span className="text-2xl font-bold text-green-600">{stats.completedProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold">
                {stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C5A572]" />
              Financial Overview
            </CardTitle>
            <CardDescription>Revenue and invoice statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-2xl font-bold text-[#C5A572]">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Invoices</span>
              <span className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Project Value</span>
              <span className="text-2xl font-bold">
                ${stats.totalProjects > 0 ? Math.round(stats.totalRevenue / stats.totalProjects).toLocaleString() : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C5A572]" />
              Equipment Utilization
            </CardTitle>
            <CardDescription>Equipment availability and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Equipment</span>
              <span className="text-2xl font-bold text-[#C5A572]">{stats.totalEquipment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available</span>
              <span className="text-2xl font-bold text-green-600">{stats.availableEquipment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilization Rate</span>
              <span className="text-2xl font-bold">
                {stats.totalEquipment > 0
                  ? Math.round(((stats.totalEquipment - stats.availableEquipment) / stats.totalEquipment) * 100)
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C5A572]" />
              Rental Activity
            </CardTitle>
            <CardDescription>Current rental statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Rentals</span>
              <span className="text-2xl font-bold text-[#C5A572]">{stats.activeRentals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Users</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Rentals/User</span>
              <span className="text-2xl font-bold">
                {stats.totalUsers > 0 ? (stats.activeRentals / stats.totalUsers).toFixed(1) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
