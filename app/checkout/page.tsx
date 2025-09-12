"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Wrench } from "lucide-react"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <Image
            src="/images/favicon-logo.png"
            alt="Platnum Construction Logo"
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-secondary/10 rounded-full">
              <Wrench className="h-12 w-12 text-secondary" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">System Under Construction</h1>

          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            We're working hard to bring you the best equipment rental checkout experience. Our booking system will be
            available soon!
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-primary mb-2">In the meantime:</h3>
            <p className="text-slate-600">
              Please contact us directly at <strong>+255 222 617171</strong> or
              <strong> info@platnumconstruction.co.tz</strong> to complete your equipment rental booking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rent"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Equipment
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              <strong className="text-primary">You Dream It, We Build It</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
