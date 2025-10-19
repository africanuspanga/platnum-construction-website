export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "client" | "project_manager" | "admin"
  company_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Equipment {
  id: string
  name: string
  category: string
  description?: string
  image_url?: string
  daily_rate: number
  status: "available" | "rented" | "maintenance"
  specifications?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Rental {
  id: string
  equipment_id: string
  client_id: string
  project_id?: string
  start_date: string
  end_date: string
  status: "pending" | "active" | "completed" | "cancelled"
  daily_rate: number
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  client_id?: string
  manager_id?: string
  status: "planning" | "in_progress" | "completed" | "on_hold"
  start_date?: string
  end_date?: string
  budget?: number
  location?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  project_id?: string
  rental_id?: string
  amount: number
  tax: number
  total: number
  status: "pending" | "paid" | "overdue" | "cancelled"
  due_date: string
  paid_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description?: string
  due_date?: string
  status: "pending" | "in_progress" | "completed"
  created_at: string
  updated_at: string
}
