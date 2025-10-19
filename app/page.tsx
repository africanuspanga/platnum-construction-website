import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Building2, Wrench, Truck, Star, ArrowRight, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-24 pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/scene-construction-site-with-equipment.jpg-ZcFQsmRjD6007T2IGwkWbHNTv2g0Cj.jpeg"
            alt="Construction site with equipment"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="font-bold text-5xl md:text-7xl mb-6 animate-fade-in font-[family-name:var(--font-space-grotesk)] text-white drop-shadow-2xl">
            You Dream It,
            <br />
            <span className="text-yellow-400 drop-shadow-2xl">We Build It.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white animate-slide-up leading-relaxed drop-shadow-lg">
            Building excellence with safety, quality, and integrity since 2008.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg animate-scale-in"
          >
            <Link href="/contact">
              Get Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-card-foreground mb-6 font-[family-name:var(--font-space-grotesk)]">
                Building Excellence Since 2008
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Platnum Construction Limited is a Tanzanian-owned company founded in 2008. With 15+ years of expertise,
                we deliver residential, commercial, and civil projects with unmatched quality and safety.
              </p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/About%201-d9ydWXAiKrybQV4CNknmd4Kj1otGXE.jpg"
                  alt="Professional construction team on site with safety equipment"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive construction solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Building2,
                title: "Building Construction",
                description: "Residential, commercial, and industrial structures built to the highest standards.",
                image: "/images/services/building-construction.jpg",
                imageAlt: "Modern residential buildings with contemporary architecture",
              },
              {
                icon: Wrench,
                title: "Civil Construction",
                description: "Site surveys, drainage, water, sewer, and utility systems infrastructure.",
                image: "/images/services/civil-construction.png",
                imageAlt: "Concrete bridge construction with pillars and framework",
              },
              {
                icon: Truck,
                title: "Plant & Equipment Hire",
                description: "Excavators, bulldozers, forklifts, and more available for rent.",
                image: "/images/services/equipment-hire.jpg",
                imageAlt: "Yellow wheel loader construction equipment on site",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-card-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/services">
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-card-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
              Featured Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Showcasing our commitment to excellence across Tanzania
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "NIT Project",
                type: "Commercial",
                location: "National Institute of Transport",
                description: "Commercial project for National Institute of Transport with state-of-the-art facilities.",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NIT%20Project-cj9YYdtsAuIUeTZAUPbGVJHZfNPVEW.jpg",
              },
              {
                title: "Boko School Project",
                type: "Educational",
                location: "Tanzania",
                description: "Educational facility development for secondary education.",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Boko%20secondary-FAEQNxBzVxwUSoL5vzmvNCFp1ZGuzn.jpg",
              },
              {
                title: "Bonyokwa High School Project",
                type: "Educational",
                location: "Tanzania",
                description: "Modern high school building construction with comprehensive facilities.",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gondwe%20school-T4ML8gwkD9s6vidZZVGmRkjOhzKFKB.jpg",
              },
            ].map((project, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
                      {project.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/projects">
                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Equipment Rental Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
              Rent Equipment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              High-quality construction equipment available for rent at competitive rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: "Caterpillar Motor Grader",
                rate: "800,000.00",
                time: "8hrs",
                image: "/images/equipment/caterpillar-motor-grader.jpg",
                description: "Professional motor grader for road construction and maintenance projects.",
              },
              {
                name: "Caterpillar Excavator",
                rate: "800,000.00",
                time: "8hrs",
                image: "/images/equipment/caterpillar-excavator.webp",
                description: "Heavy-duty excavator for digging, trenching, and material handling.",
              },
              {
                name: "Komatsu Bulldozer",
                rate: "1,200,000.00",
                time: "8hrs",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Komatsu%20Bullzoer-qWgmuZJya4D4HkcRreeevIC2C42Kq3.jpg",
                description: "Powerful bulldozer for earthmoving and site preparation work.",
              },
            ].map((equipment, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={equipment.image || "/placeholder.svg"}
                    alt={equipment.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">{equipment.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{equipment.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
                      {equipment.time}
                    </span>
                    <span className="text-lg font-bold text-primary">TSH {equipment.rate}</span>
                  </div>
                  <Button asChild className="w-full" size="sm">
                    <Link href="/rent">Rent Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link href="/rent">
                View All Equipment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Updated Client Logos Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-card-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground">We're proud to work with leading companies across Tanzania</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/abood.png"
                alt="ABOOD"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/apel.png"
                alt="APEL Petroleum Limited"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/tsb.jpg"
                alt="Tanzania Sisal Board"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/tcaa.jpg"
                alt="TCAA"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/dar-municipal.jpg"
                alt="Dar es Salaam Municipal Council"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/domco.jpg"
                alt="Domco"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/tarura.png"
                alt="TARURA"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/oilcom.jpg"
                alt="OILCOM"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="aspect-[4/3] bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
              <Image
                src="/images/clients/watercom.png"
                alt="WATERCOM"
                width={160}
                height={120}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Let Us Build Your Dream Project Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-space-grotesk)]">
                Let Us Build Your Dream Project
              </h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                With over <span className="text-[#C5A572] font-semibold">two decades of experience</span> in the
                construction industry, Platnum Construction has built a reputation for excellence, quality, and
                reliability across Tanzania.
              </p>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Our <span className="text-[#C5A572] font-semibold">strong team of professionals</span> is dedicated to
                turning your vision into reality. From residential buildings to large-scale commercial projects, we have
                the expertise and equipment to deliver exceptional results on time and within budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-[#C5A572] rounded-full p-2">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">20+ Years</p>
                    <p className="text-white/70 text-sm">Industry Experience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#C5A572] rounded-full p-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Expert Team</p>
                    <p className="text-white/70 text-sm">Skilled Professionals</p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="bg-[#C5A572] hover:bg-[#B39562] text-white px-8 py-6 text-lg">
                <Link href="/login">
                  BOOK PROJECT <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-10-19%20at%2023.30.21.png-7xMpkkcOSym0cpber3haYMbpIltRuT.jpeg"
                  alt="Hyundai excavator working on construction site"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updated Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-space-grotesk)]">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "Platnum Construction delivered our residential project with exceptional quality and attention to
                  detail. Their team was professional and completed everything on schedule."
                </p>
                <div>
                  <p className="font-semibold text-card-foreground">Peter Lazaro</p>
                  <p className="text-sm text-muted-foreground">Project Manager, Housing Development</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "We hired their excavators for our infrastructure project. The equipment was in excellent condition
                  and their operators were highly skilled and reliable."
                </p>
                <div>
                  <p className="font-semibold text-card-foreground">Clemence Mushi</p>
                  <p className="text-sm text-muted-foreground">Civil Engineer, Municipal Works</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "Outstanding construction services for our commercial building. Platnum Construction exceeded our
                  expectations with their commitment to safety and quality standards."
                </p>
                <div>
                  <p className="font-semibold text-card-foreground">John Shahidi</p>
                  <p className="text-sm text-muted-foreground">Construction Supervisor, Commercial Projects</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "Their equipment rental service is top-notch. We've been using their bulldozers and forklifts for
                  multiple projects and they never disappoint."
                </p>
                <div>
                  <p className="font-semibold text-card-foreground">Zuhura Mohammed</p>
                  <p className="text-sm text-muted-foreground">Equipment Manager, Infrastructure Development</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "Professional team with deep expertise in civil construction. They handled our drainage and utility
                  systems project flawlessly from start to finish."
                </p>
                <div>
                  <p className="font-semibold text-card-foreground">Hassan Mwalimu</p>
                  <p className="text-sm text-muted-foreground">Site Engineer, Public Works</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)] text-white">
            Ready to build your dream project?
          </h2>
          <p className="text-xl mb-8 text-white/90 leading-relaxed">
            Let's discuss how Platnum Construction can bring your vision to life with our expertise and commitment to
            excellence.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg"
          >
            <Link href="/contact">
              Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
