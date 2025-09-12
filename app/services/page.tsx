import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Building, Wrench, Truck, Search } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: <Building className="h-12 w-12 text-secondary" />,
      title: "Building Construction",
      description:
        "Design, planning, management, and construction of residential, commercial, and industrial buildings.",
      features: ["Residential Projects", "Commercial Buildings", "Industrial Facilities", "Project Management"],
      image: "/images/services/building-construction.jpg",
      imageAlt: "Modern residential buildings with contemporary architecture",
    },
    {
      icon: <Wrench className="h-12 w-12 text-secondary" />,
      title: "Civil Construction",
      description: "BOQ preparation, site surveys, drainage, water & sewer, utility installations.",
      features: ["BOQ Preparation", "Site Surveys", "Drainage Systems", "Utility Installations"],
      image: "/images/services/civil-construction.png",
      imageAlt: "Concrete bridge construction with pillars and framework",
    },
    {
      icon: <Truck className="h-12 w-12 text-secondary" />,
      title: "Plant & Equipment Hire",
      description: "Heavy machinery like excavators, bulldozers, forklifts, backhoes.",
      features: ["Excavators", "Bulldozers", "Forklifts", "Backhoes"],
      image: "/images/services/equipment-hire.jpg",
      imageAlt: "Yellow wheel loader construction equipment on site",
    },
    {
      icon: <Truck className="h-12 w-12 text-secondary" />,
      title: "Transportation",
      description: "Fleet of trucks for reliable logistics of materials and machinery.",
      features: ["Material Transport", "Equipment Delivery", "Logistics Management", "Reliable Fleet"],
      image: "/images/services/transportation.jpg",
      imageAlt: "Yellow HOWO dump truck for construction material transport",
    },
    {
      icon: <Search className="h-12 w-12 text-secondary" />,
      title: "Value-Added Services",
      description: "Site analysis, feasibility studies, environmental assessments.",
      features: ["Site Analysis", "Feasibility Studies", "Environmental Assessments", "Consulting"],
      image: "/images/services/value-added.jpg",
      imageAlt: "Hands reviewing architectural blueprints and technical drawings",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-balance mb-6">
              Our <span className="text-primary">Services</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Comprehensive construction solutions tailored to your needs
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-6">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                  <CardTitle className="text-2xl font-heading">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-lg">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Our Process</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From concept to completion, we ensure every step is executed with precision
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Consultation", desc: "Understanding your vision and requirements" },
              { step: "02", title: "Planning", desc: "Detailed project planning and design" },
              { step: "03", title: "Execution", desc: "Professional construction with quality control" },
              { step: "04", title: "Delivery", desc: "Timely completion and handover" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">See Our Work in Action</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Explore our portfolio of completed and ongoing projects across Tanzania
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/projects">View Projects</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
