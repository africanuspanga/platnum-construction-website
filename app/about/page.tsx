import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Users, Award, Shield, Lightbulb, Heart, FileCheck, Building } from "lucide-react"

export default function AboutPage() {
  const coreValues = [
    {
      icon: <CheckCircle className="h-8 w-8 text-secondary" />,
      title: "Integrity",
      description: "Ethical standards in all dealings with unwavering honesty and transparency.",
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: "Professionalism",
      description: "Skilled workforce, trained continuously to deliver exceptional results.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-secondary" />,
      title: "Innovation",
      description: "Using latest techniques & technology to stay ahead of industry standards.",
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Safety",
      description: "Staff and client safety comes first in every project we undertake.",
    },
    {
      icon: <Award className="h-8 w-8 text-secondary" />,
      title: "Quality",
      description: "Delivering value-driven results that exceed expectations every time.",
    },
    {
      icon: <Heart className="h-8 w-8 text-secondary" />,
      title: "Community",
      description: "Supporting local initiatives and creating meaningful employment opportunities.",
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
              About <span className="text-primary">Platnum</span> Construction
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Building excellence with safety, quality, and integrity since 2008
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Founded in 2008, Platnum Construction Limited has grown to become one of Tanzania's most trusted
                  construction companies. As a proudly Tanzanian-owned enterprise, we've built our reputation on
                  delivering exceptional construction services across residential, commercial, and civil projects.
                </p>
                <p>
                  With over 20 dedicated staff members and significant investment in our plant and fleet, we combine
                  local expertise with international standards to bring your construction dreams to life.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2008</div>
                  <div className="text-sm text-muted-foreground">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-muted-foreground">Staff Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Tanzanian Owned</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/about-story.jpg"
                  alt="Heavy construction equipment showcasing our capabilities and expertise"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Quality */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold font-heading mb-4 text-primary">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide exceptional construction services that exceed client expectations while maintaining the
                  highest standards of safety, quality, and professionalism.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold font-heading mb-4 text-primary">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be Tanzania's leading construction company, recognized for innovation, reliability, and our
                  commitment to building sustainable communities.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold font-heading mb-4 text-primary">Quality Promise</h3>
                <p className="text-muted-foreground">
                  We deliver value-driven results through meticulous planning, skilled craftsmanship, and unwavering
                  attention to detail in every project.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold font-heading mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Our Compliance Statement</h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Platnum Construction Limited prides itself on its commitment to the welfare of its staff and has a moral
              obligation to its workforce by ensuring the working environment is as safe as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card className="p-8">
              <CardContent className="pt-6">
                <div className="flex items-center mb-6">
                  <FileCheck className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold font-heading">Legal Compliance</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  We adhere to the rules, laws, and regulations of Tanzania, including:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    The Employment & Labour Relation Act 2004
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    The Contractors Registration Act 1997
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    The Engineers Registration Act 1997
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Workers Compensation Act 2015
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Occupational Health and Safety Act 2003
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Environmental Management Act 2004
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Fire and Rescue Force Act 2007
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    The Companies Act 2002
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="pt-6">
                <div className="flex items-center mb-6">
                  <Building className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold font-heading">Professional Registration</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  In order to maintain our performance record and provide quality services to the public, we have
                  registered our company with top professional boards:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Contractors Registration Board (CRB)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    Engineers Registration Board (ERB)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                    The Architects and Quantity Surveyors Registration Board (AQSRB)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="p-8 mb-16">
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-6">Our Commitment</h3>
                  <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                    <p>
                      Over and above standard company routines, Platnum Construction Limited management is dedicated to
                      paying great attention to the needs of its staff at all levels. Management will ensure that
                      significant risks are assessed, and suitable and sufficient measures are taken to allow each
                      employee/contractor to carry out their duties in a safe environment without risking their health.
                    </p>
                    <p>
                      Suitable equipment will be provided and maintained in good condition, and safe systems of work
                      will be followed. The company will also seek external advice as necessary to stay updated on
                      compliance practices in accordance with current legislation.
                    </p>
                    <p className="font-semibold">
                      Platnum Construction Ltd is proud of and dependent on its highly motivated and very skilled
                      workforce. Without them, the company would not maintain its profound good reputation for
                      performance and due diligence in delivering work within the region and Tanzania at large.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src="/images/about-commitment.jpg"
                      alt="Professional construction equipment demonstrating our commitment to quality and safety"
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Government Institution Logos */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold font-heading mb-8">Compliant with Tanzanian Government Institutions</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-6">
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/environmental-authority.png"
                  alt="Environmental Management Authority"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/aqsrb.png"
                  alt="Architects and Quantity Surveyors Registration Board"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/nssf.png"
                  alt="National Social Security Fund"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/erb.jpg"
                  alt="Engineers Registration Board"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/wcf.png"
                  alt="Workers Compensation Fund"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/crb.jpg"
                  alt="Contractors Registration Board"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/fire-rescue.png"
                  alt="Tanzania Fire and Rescue Service"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/tra.png"
                  alt="Tanzania Revenue Authority"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="aspect-square bg-white rounded-lg border-2 border-muted flex items-center justify-center p-4 hover:shadow-md transition-shadow">
                <img
                  src="/images/compliance/osha.jpg"
                  alt="Occupational Safety and Health Authority"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Ready to Build Your Dream?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover our comprehensive range of construction and rental services
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
