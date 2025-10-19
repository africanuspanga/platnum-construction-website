import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="col-span-1">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-10-19%20at%2023.26.33-m85KGvAATWfOjG3kG4AeZ7YEFj5jcs.png"
              alt="Platnum Construction Logo"
              width={150}
              height={45}
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-4">You Dream It, We Build It.</p>
            <div className="flex space-x-4">
              <span className="text-gray-400 cursor-not-allowed">
                <Facebook className="h-5 w-5" />
              </span>
              <span className="text-gray-400 cursor-not-allowed">
                <Twitter className="h-5 w-5" />
              </span>
              <span className="text-gray-400 cursor-not-allowed">
                <Linkedin className="h-5 w-5" />
              </span>
              <a
                href="https://www.instagram.com/platnumconstructiontz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#C5A572] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#C5A572]">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/services", label: "Services" },
                { href: "/projects", label: "Projects" },
                { href: "/contact", label: "Contact Us" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#C5A572]">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                  Building Construction
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                  Civil Construction
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                  Equipment Rental
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                  Project Management
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-[#C5A572] transition-colors duration-200">
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#C5A572]">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#C5A572] mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  Mbezi Beach, Tanki Bovu,
                  <br />
                  Oilcom Petrol Station,
                  <br />
                  Bagamoyo Rd, Dar es Salaam
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#C5A572]" />
                <a href="tel:+255222617171" className="text-gray-300 text-sm hover:text-[#C5A572] transition-colors">
                  +255 222 617171
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#C5A572]" />
                <a
                  href="mailto:info@platnumconstruction.co.tz"
                  className="text-gray-300 text-sm hover:text-[#C5A572] transition-colors"
                >
                  info@platnumconstruction.co.tz
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-center text-gray-400 text-sm">
              © 2025 Platnum Construction Limited. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-[#C5A572] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-[#C5A572] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
