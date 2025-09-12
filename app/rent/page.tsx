"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Plus, Minus, ShoppingCart, Trash2, Calendar } from "lucide-react"

interface Equipment {
  id: string
  name: string
  rate: string
  time: string
}

interface CartItem extends Equipment {
  quantity: number
  startDate: string
  endDate: string
  totalDays: number
}

export default function RentPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const equipmentData: Equipment[] = [
    { id: "1", name: "Caterpillar Motor Grader", rate: "800,000.00", time: "8hrs" },
    { id: "2", name: "Caterpillar Excavator", rate: "800,000.00", time: "8hrs" },
    { id: "3", name: "Caterpillar Bulldozer", rate: "1,200,000.00", time: "8hrs" },
    { id: "4", name: "JCB Backhoe", rate: "700,000.00", time: "8hrs" },
    { id: "5", name: "JCB Hydraulic Excavator", rate: "800,000.00", time: "8hrs" },
    { id: "6", name: "Hyundai Excavator", rate: "800,000.00", time: "8hrs" },
    { id: "7", name: "Sany Concrete Mixer", rate: "500,000.00", time: "8hrs" },
    { id: "8", name: "Qingnong Concrete Mixer", rate: "500,000.00", time: "8hrs" },
    { id: "9", name: "Schwinn Stetter Concrete Pump", rate: "700,000.00", time: "8hrs" },
    { id: "10", name: "Sino Truck", rate: "600,000.00", time: "8hrs" },
    { id: "11", name: "Mitsubishi Crane", rate: "1,500,000.00", time: "8hrs" },
    { id: "12", name: "Hino Crane", rate: "400,000.00", time: "8hrs" },
    { id: "13", name: "Mitsubishi", rate: "400,000.00", time: "8hrs" },
    { id: "14", name: "Mitsubishi Canter", rate: "400,000.00", time: "8hrs" },
    { id: "15", name: "Toyota Townace", rate: "400,000.00", time: "8hrs" },
    { id: "16", name: "Mitsubishi Fuso", rate: "400,000.00", time: "8hrs" },
    { id: "17", name: "KM Trailer", rate: "600,000.00", time: "8hrs" },
    { id: "18", name: "CIMC Trailer", rate: "600,000.00", time: "8hrs" },
  ]

  const addToCart = (equipment: Equipment, startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const isAvailable = checkAvailability(equipment.id, startDate, endDate)

    if (!isAvailable) {
      alert("Equipment is not available for the selected dates. Please choose different dates.")
      return
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === equipment.id && item.startDate === startDate && item.endDate === endDate,
      )
      if (existing) {
        return prev.map((item) =>
          item.id === equipment.id && item.startDate === startDate && item.endDate === endDate
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [
        ...prev,
        {
          ...equipment,
          quantity: 1,
          startDate,
          endDate,
          totalDays,
        },
      ]
    })

    setAddedItems((prev) => new Set(prev).add(equipment.id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(equipment.id)
        return newSet
      })
    }, 2000)

    setIsModalOpen(false)
    setStartDate("")
    setEndDate("")
    setSelectedEquipment(null)
  }

  const checkAvailability = (equipmentId: string, startDate: string, endDate: string): boolean => {
    return Math.random() > 0.1
  }

  const handleAddToCart = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsModalOpen(true)
  }

  const handleDateSubmit = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.")
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      alert("Start date cannot be in the past.")
      return
    }

    if (end < start) {
      alert("End date must be after start date.")
      return
    }

    if (selectedEquipment) {
      addToCart(selectedEquipment, startDate, endDate)
    }
  }

  const updateQuantity = (id: string, startDate: string, endDate: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, startDate, endDate)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.startDate === startDate && item.endDate === endDate ? { ...item, quantity } : item,
      ),
    )
  }

  const removeFromCart = (id: string, startDate: string, endDate: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.startDate === startDate && item.endDate === endDate)),
    )
  }

  const getTotalCost = () => {
    return cart.reduce((total, item) => {
      const dailyRate = Number.parseFloat(item.rate.replace(/,/g, ""))
      return total + dailyRate * item.totalDays * item.quantity
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return `TSH ${amount.toLocaleString()}.00`
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-balance mb-6">
              Equipment <span className="text-primary">Rental</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              We maintain a modern fleet of machinery, serviced regularly to guarantee efficiency and safety. Rent our
              equipment for your construction projects at competitive rates.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-heading mb-8">Available Equipment</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {equipmentData.map((item, index) => {
                const equipmentImages = [
                  "/images/equipment/caterpillar-motor-grader.jpg",
                  "/images/equipment/caterpillar-excavator.webp",
                  "/images/equipment/caterpillar-bulldozer.webp",
                  "/images/equipment/jcb-backhoe.webp",
                  "/images/equipment/jcb-hydraulic-excavator.jpg",
                  "/images/equipment/hyundai-excavator.avif",
                  "/images/equipment/sany-concrete-mixer.webp",
                  "/images/equipment/qingnong-concrete-mixer.webp",
                  "/images/equipment/schwing-concrete-pump.jpg",
                  "/images/equipment/sino-truck.jpg",
                  "/images/equipment/mitsubishi-crane.png",
                  "/images/equipment/hino-crane.png",
                  "/images/equipment/mitsubishi-canter.png",
                  "/images/equipment/mitsubishi-canter-custom.png",
                  "/images/equipment/toyota-townace.png",
                  "/images/equipment/mitsubishi-fuso.png",
                  "/images/equipment/km-trailer.jpg",
                  "/images/equipment/cimc-trailer.webp",
                ]

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                      {index < 18 ? (
                        <img
                          src={equipmentImages[index] || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <div className="text-4xl mb-2">🚜</div>
                          <div className="text-sm">Equipment Image</div>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{item.time}</Badge>
                        <span className="text-lg font-bold text-primary">
                          TSH {item.rate}/{item.time}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="w-full"
                        size="sm"
                        variant={addedItems.has(item.id) ? "secondary" : "default"}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {addedItems.has(item.id) ? "Added!" : "Select Dates"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Rental Cart ({getTotalItems()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.startDate}-${item.endDate}-${index}`}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">TSH {item.rate}/day</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(item.startDate).toLocaleDateString()} -{" "}
                              {new Date(item.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.totalDays} day{item.totalDays > 1 ? "s" : ""}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id, item.startDate, item.endDate)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.startDate, item.endDate, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.startDate, item.endDate, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(
                              Number.parseFloat(item.rate.replace(/,/g, "")) * item.totalDays * item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(getTotalCost())}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Rental Dates</DialogTitle>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">{selectedEquipment.name}</h3>
                <p className="text-sm text-muted-foreground">TSH {selectedEquipment.rate} per day</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    Duration:{" "}
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) +
                      1}{" "}
                    days
                  </p>
                  <p className="font-semibold text-primary">
                    Total:{" "}
                    {formatCurrency(
                      Number.parseFloat(selectedEquipment.rate.replace(/,/g, "")) *
                        (Math.ceil(
                          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
                        ) +
                          1),
                    )}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDateSubmit} className="flex-1">
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
