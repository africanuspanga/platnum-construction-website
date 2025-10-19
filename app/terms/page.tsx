import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the services of Platnum Construction Limited, you agree to be bound by these Terms
                of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Services</h2>
              <p className="leading-relaxed">
                Platnum Construction Limited provides construction services, equipment rental, project management, and
                related services. We reserve the right to modify, suspend, or discontinue any service at any time
                without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="leading-relaxed mb-3">When using our services, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use our services for any unlawful purpose</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Equipment Rental Terms</h2>
              <p className="leading-relaxed mb-3">For equipment rental services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Rental rates are subject to change and must be confirmed at time of booking</li>
                <li>Equipment must be returned in the same condition as received</li>
                <li>You are responsible for any damage or loss during the rental period</li>
                <li>Payment terms must be agreed upon before equipment delivery</li>
                <li>Cancellations must be made at least 24 hours in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Agreements</h2>
              <p className="leading-relaxed">
                All construction projects require a separate written agreement detailing scope of work, timeline,
                payment terms, and other project-specific terms. These Terms of Service are supplementary to any
                project-specific agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <p className="leading-relaxed">
                Payment terms will be specified in individual service agreements. Late payments may incur additional
                charges. We reserve the right to suspend services for non-payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="leading-relaxed">
                Platnum Construction Limited shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages resulting from your use of our services. Our total liability shall not exceed the
                amount paid for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, trademarks, and intellectual property on our website and in our materials remain the
                property of Platnum Construction Limited. You may not use our intellectual property without prior
                written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of Tanzania. Any
                disputes shall be resolved in the courts of Dar es Salaam.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                posting to our website. Your continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, please contact us at:
                <br />
                Email: info@platnumconstruction.co.tz
                <br />
                Phone: +255 222 617171
                <br />
                Address: Mbezi Beach, Tanki Bovu, Bagamoyo Rd, Dar es Salaam
              </p>
            </section>

            <section>
              <p className="text-sm text-gray-600 mt-8">Last updated: January 2025</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
