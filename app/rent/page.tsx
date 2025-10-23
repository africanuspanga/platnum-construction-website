"use client"

import type React from "react"

import { useState, useCallback, memo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

interface CartContentProps {
  cart: CartItem[]
  guestName: string
  guestPhone: string
  guestEmail: string
  guestCompany: string
  notes: string
  isSubmitting: boolean
  setGuestName: (value: string) => void
  setGuestPhone: (value: string) => void
  setGuestEmail: (value: string) => void
  setGuestCompany: (value: string) => void
  setNotes: (value: string) => void
  updateQuantity: (id: string, startDate: string, endDate: string, quantity: number) => void
  removeFromCart: (id: string, startDate: string, endDate: string) => void
  handleProceedBooking: () => void
  formatCurrency: (amount: number) => string
  getTotalCost: () => number
}

const CartContent = memo(
  ({
    cart,
    guestName,
    guestPhone,
    guestEmail,
    guestCompany,
    notes,
    isSubmitting,
    setGuestName,
    setGuestPhone,
    setGuestEmail,
    setGuestCompany,
    setNotes,
    updateQuantity,
    removeFromCart,
    handleProceedBooking,
    formatCurrency,
    getTotalCost,
  }: CartContentProps) => (
    <>
      {cart.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.startDate}-${item.endDate}-${index}`} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">TSH {item.rate}/day</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
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
                    {formatCurrency(Number.parseFloat(item.rate.replace(/,/g, "")) * item.totalDays * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Your Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="guest-name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="guest-name"
                    placeholder="John Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guest-phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    placeholder="+255 XXX XXX XXX"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="guest-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="john@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="guest-company" className="text-foreground">
                    Company Name
                  </Label>
                  <Input
                    id="guest-company"
                    placeholder="ABC Construction Ltd"
                    value={guestCompany}
                    onChange={(e) => setGuestCompany(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-foreground">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(getTotalCost())}</span>
            </div>
          </div>

          <Button onClick={handleProceedBooking} className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Our team will contact you shortly to confirm your booking
          </p>
        </div>
      )}
    </>
  ),
)

CartContent.displayName = "CartContent"

export default function RentPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestCompany, setGuestCompany] = useState("")
  const [notes, setNotes] = useState("")

  const equipmentData: Equipment[] = [
    { id: "1", name: "Caterpillar Motor Grader", rate: "800,000.00", time: "8hrs" },
    { id: "2", name: "Caterpillar Excavator", rate: "800,000.00", time: "8hrs" },
    { id: "3", name: "Komatsu Bulldozer", rate: "1,200,000.00", time: "8hrs" },
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
    {
      id: "17",
      name: "CIMC Lowbed Trailer with Tractor (For Haulage Services)",
      rate: "1,200,000.00",
      time: "per trip",
    },
    { id: "18", name: "Roller-Compactor", rate: "600,000.00", time: "8hrs" },
  ]

  const addToCart = (equipment: Equipment, startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

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

  const updateQuantity = useCallback((id: string, startDate: string, endDate: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter((item) => !(item.id === id && item.startDate === startDate && item.endDate === endDate)),
      )
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.startDate === startDate && item.endDate === endDate ? { ...item, quantity } : item,
      ),
    )
  }, [])

  const removeFromCart = useCallback((id: string, startDate: string, endDate: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.startDate === startDate && item.endDate === endDate)),
    )
  }, [])

  const getTotalCost = useCallback(() => {
    return cart.reduce((total, item) => {
      const dailyRate = Number.parseFloat(item.rate.replace(/,/g, ""))
      return total + dailyRate * item.totalDays * item.quantity
    }, 0)
  }, [cart])

  const formatCurrency = useCallback((amount: number) => {
    return `TSH ${amount.toLocaleString()}.00`
  }, [])

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleProceedBooking = async () => {
    if (!guestName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!guestPhone.trim()) {
      alert("Please enter your phone number")
      return
    }

    if (cart.length === 0) {
      alert("Your cart is empty")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting rental request...")

      const requestBody = {
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail || null,
        guest_company: guestCompany || null,
        notes: notes || null,
        items: cart.map((item) => ({
          equipment_id: item.id,
          equipment_name: item.name,
          start_date: item.startDate,
          end_date: item.endDate,
          quantity: item.quantity,
          daily_rate: item.rate,
          total_days: item.totalDays,
        })),
        total_cost: getTotalCost(),
      }

      console.log("[v0] Request body:", requestBody)

      const response = await fetch("/api/rentals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text)
        throw new Error("Server returned an invalid response. Please try again.")
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit rental request")
      }

      const whatsappMessage = `*EQUIPMENT RENTAL REQUEST*%0A%0A*Customer Details:*%0AName: ${encodeURIComponent(guestName)}%0APhone: ${encodeURIComponent(guestPhone)}${guestEmail ? `%0AEmail: ${encodeURIComponent(guestEmail)}` : ""}${guestCompany ? `%0ACompany: ${encodeURIComponent(guestCompany)}` : ""}%0A%0A*Equipment Requested:*%0A${cart.map((item) => `%0A${encodeURIComponent(item.name)}%0A- Dates: ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}%0A- Duration: ${item.totalDays} days%0A- Quantity: ${item.quantity}%0A- Rate: TSH ${item.rate}/day%0A- Subtotal: TSH ${(Number.parseFloat(item.rate.replace(/,/g, "")) * item.totalDays * item.quantity).toLocaleString()}`).join("")}%0A%0A*Total Cost: TSH ${getTotalCost().toLocaleString()}*${notes ? `%0A%0A*Notes:*%0A${encodeURIComponent(notes)}` : ""}`

      const whatsappNumber = "255749777700"
      window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank")

      setCart([])
      setGuestName("")
      setGuestPhone("")
      setGuestEmail("")
      setGuestCompany("")
      setNotes("")
      setIsCartOpen(false)

      alert(
        "Your rental request has been sent! Please complete the WhatsApp message that just opened. Our team will contact you shortly at " +
          guestPhone +
          " to confirm your booking.",
      )
    } catch (error: any) {
      console.error("[v0] Error submitting rental request:", error)
      alert(
        "There was an issue sending your request. Please contact us directly at info@platnumconstruction.co.tz or +255 749 777 700",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }, [])

  // Removed the original CartContent function and replaced with the memoized component above

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
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Komatsu%20Bullzoer-qWgmuZJya4D4HkcRreeevIC2C42Kq3.jpg",
                  "/images/equipment/jcb-backhoe.webp",
                  "/images/equipment/jcb-hydraulic-excavator.jpg",
                  "/images/equipment/hyundai-excavator.avif",
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/concete%20mixer-74KMzPfp0t1kEOT6nicsEv1CJNRT1Z.jpg",
                  "/images/equipment/qingnong-concrete-mixer.webp",
                  "/images/equipment/schwing-concrete-pump.jpg",
                  "/images/equipment/sino-truck.jpg",
                  "/images/equipment/mitsubishi-crane.png",
                  "/images/equipment/hino-crane.png",
                  "/images/equipment/mitsubishi-canter.png",
                  "/images/equipment/mitsubishi-canter-custom.png",
                  "/images/equipment/toyota-townace.png",
                  "/images/equipment/mitsubishi-fuso.png",
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CIMC%20Lowbed%20Trailer%20with%20Tractor%20%28For%20Haulage%20Services%29%20-PcDywhnjSR5XXlgYtvCM4x3hYBikeL.png",
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/csm_BW_212_D_SL_S_f1d1fd92f3-wuNNzOHikM8VlH8KboqCu6a6mXV75O.webp",
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

          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Rental Request ({getTotalItems()})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                <CartContent
                  cart={cart}
                  guestName={guestName}
                  guestPhone={guestPhone}
                  guestEmail={guestEmail}
                  guestCompany={guestCompany}
                  notes={notes}
                  isSubmitting={isSubmitting}
                  setGuestName={setGuestName}
                  setGuestPhone={setGuestPhone}
                  setGuestEmail={setGuestEmail}
                  setGuestCompany={setGuestCompany}
                  setNotes={setNotes}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  handleProceedBooking={handleProceedBooking}
                  formatCurrency={formatCurrency}
                  getTotalCost={getTotalCost}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button size="lg" className="rounded-full shadow-lg h-16 w-16 p-0" onClick={() => setIsCartOpen(true)}>
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </span>
            </div>
          </Button>
        </div>
      )}

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Rental Request ({getTotalItems()})
            </DialogTitle>
          </DialogHeader>
          <CartContent
            cart={cart}
            guestName={guestName}
            guestPhone={guestPhone}
            guestEmail={guestEmail}
            guestCompany={guestCompany}
            notes={notes}
            isSubmitting={isSubmitting}
            setGuestName={setGuestName}
            setGuestPhone={setGuestPhone}
            setGuestEmail={setGuestEmail}
            setGuestCompany={setGuestCompany}
            setNotes={setNotes}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            handleProceedBooking={handleProceedBooking}
            formatCurrency={formatCurrency}
            getTotalCost={getTotalCost}
          />
        </DialogContent>
      </Dialog>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-foreground">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-foreground">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className="text-foreground"
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

              <div className="flex flex-col sm:flex-row gap-2">
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
