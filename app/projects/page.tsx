"use client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin } from "lucide-react"

export default function ProjectsPage() {
  const completedProjects = [
    {
      name: "Mbagala Kijichi Project",
      location: "Dar es Salaam",
      description: "Residential housing project featuring modern amenities and sustainable design.",
      type: "Residential",
    },
    {
      name: "NIT Project",
      location: "Dar es Salaam",
      description: "Commercial project for National Institute of Transport with state-of-the-art facilities.",
      type: "Commercial",
    },
    {
      name: "Snake Park Project",
      location: "Dar es Salaam",
      description: "Tourist facility development with visitor centers and recreational areas.",
      type: "Tourism",
    },
    {
      name: "O Gas Project",
      location: "Tanzania",
      description: "Fuel and energy infrastructure development for improved energy distribution.",
      type: "Industrial",
    },
    {
      name: "Al-Hushoom ICD/CFS Project",
      location: "Dar es Salaam",
      description: "Logistics hub development for enhanced cargo and freight services.",
      type: "Logistics",
    },
    {
      name: "Mahamood Mohamed Daule Transport",
      location: "Tanzania",
      description: "Industrial warehouse facility for transportation and logistics operations.",
      type: "Industrial",
    },
    {
      name: "Monalisa Go-Down Project",
      location: "Tanzania",
      description: "Storage and distribution facility with modern warehousing solutions.",
      type: "Warehouse",
    },
    {
      name: "Watercom TAZARA Project",
      location: "Tanzania",
      description: "Industrial site development for railway infrastructure support.",
      type: "Industrial",
    },
    {
      name: "Morocco & Mbagala Projects",
      location: "Dar es Salaam",
      description: "Urban development and housing projects for growing communities.",
      type: "Residential",
    },
    {
      name: "Issa Mbuzi Project",
      location: "Tanzania",
      description: "Residential project featuring quality housing solutions.",
      type: "Residential",
    },
  ]

  const ongoingProjects = [
    {
      name: "JNIA Project",
      location: "Julius Nyerere International Airport",
      description: "Infrastructure work at Tanzania's main international airport.",
      type: "Infrastructure",
    },
    {
      name: "Boko Sekondari Project",
      location: "Tanzania",
      description: "Educational facility development for secondary education.",
      type: "Educational",
    },
    {
      name: "Tuangoma Projects",
      location: "Tanzania",
      description: "Residential & community development for sustainable living.",
      type: "Community",
    },
  ]

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Residential: "bg-blue-100 text-blue-800",
      Commercial: "bg-green-100 text-green-800",
      Industrial: "bg-orange-100 text-orange-800",
      Tourism: "bg-purple-100 text-purple-800",
      Logistics: "bg-yellow-100 text-yellow-800",
      Warehouse: "bg-gray-100 text-gray-800",
      Infrastructure: "bg-red-100 text-red-800",
      Educational: "bg-indigo-100 text-indigo-800",
      Community: "bg-pink-100 text-pink-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-balance mb-6">
              Our <span className="text-primary">Projects</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Completed and ongoing projects across Tanzania, delivering excellence in every build
            </p>
          </div>
        </div>
      </section>

      {/* Projects Tabs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="completed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12">
              <TabsTrigger value="completed" className="text-lg">
                Completed Projects ({completedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="text-lg">
                Ongoing Projects ({ongoingProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map((project, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-2">🏗️</div>
                        <div className="text-sm">Project Image</div>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                        <Badge className={getTypeColor(project.type)} variant="secondary">
                          {project.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ongoing">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingProjects.map((project, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                  >
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="text-4xl mb-2">🚧</div>
                        <div className="text-sm">Project Image</div>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                        <Badge className={getTypeColor(project.type)} variant="secondary">
                          {project.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <Badge variant="outline" className="text-xs">
                        In Progress
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-balance mb-6">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Let's discuss how we can bring your construction vision to life with our proven expertise and quality
            craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Free Quote
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
            >
              View Our Services
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
