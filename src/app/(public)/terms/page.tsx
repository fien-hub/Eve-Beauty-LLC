import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertCircle, Users } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read Eve Beauty\'s terms of service and user agreement. A service by Eve Beauty LLC.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#3B82F6]" />
            <span className="text-sm font-medium text-[#6B6B6B]">Legal Agreement</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Terms of Service</h1>
          <p className="text-lg text-[#6B6B6B]">Last updated: December 6, 2024</p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          
          <Section title="1. Agreement to Terms" icon={<FileText className="w-5 h-5" />}>
            <p>
              By accessing and using Eve Beauty (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by Eve Beauty LLC, you accept and agree to be bound by the terms
              and provisions of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service, including customers who book
              services and providers who offer services.
            </p>
          </Section>

          <Section title="2. Definitions">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>&quot;Customer&quot;</strong> refers to users who book beauty and wellness services</li>
              <li><strong>&quot;Provider&quot;</strong> refers to beauty professionals who offer services through our platform</li>
              <li><strong>&quot;Services&quot;</strong> includes all beauty and wellness services offered through Eve Beauty</li>
              <li><strong>&quot;Platform&quot;</strong> refers to Eve Beauty&apos;s website, mobile application, and related services</li>
              <li><strong>&quot;Content&quot;</strong> includes text, images, videos, and other materials posted on the platform</li>
            </ul>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must be at least 18 years old to use this platform. By using Eve Beauty, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>All information you provide is accurate and complete</li>
            </ul>
          </Section>

          <Section title="4. Account Registration" icon={<Users className="w-5 h-5" />}>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">For All Users</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate, current, and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must not share your account credentials</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One person or business may maintain only one account</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">For Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must complete identity verification</li>
              <li>You must provide proof of professional licenses/certifications (if applicable)</li>
              <li>You must have appropriate insurance coverage</li>
              <li>You must comply with all local business regulations</li>
            </ul>
          </Section>

          <Section title="5. Services and Bookings">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">For Customers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bookings are subject to provider availability</li>
              <li>You must provide accurate booking information</li>
              <li>Payment is required at time of booking</li>
              <li>Cancellation policies vary by provider</li>
              <li>You must be present for your scheduled appointment</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">For Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must accurately describe your services and pricing</li>
              <li>You must maintain professional standards</li>
              <li>You must honor confirmed bookings or notify customers promptly of cancellations</li>
              <li>You must provide services at the agreed-upon time and location</li>
              <li>You are an independent contractor, not an employee of Eve Beauty LLC</li>
            </ul>
          </Section>

          <Section title="6. Payments and Fees">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">Customer Payments</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed securely through Stripe</li>
              <li>Payment is charged at time of booking</li>
              <li>Refunds are subject to cancellation policies</li>
              <li>You may be charged for late cancellations or no-shows</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Provider Payouts</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Eve Beauty charges a service fee on each booking (typically 15-20%)</li>
              <li>Payouts are processed within 2-5 business days after service completion</li>
              <li>You are responsible for all applicable taxes</li>
              <li>You must maintain a valid payment account (Stripe Connect)</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Travel Fees</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard travel fees apply based on distance</li>
              <li>Under 5 miles: Free</li>
              <li>5-10 miles: $10</li>
              <li>10-15 miles: $25</li>
              <li>15+ miles: $50</li>
            </ul>
          </Section>

          <Section title="7. Cancellation and Refund Policy">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">Cancellation by Customer</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>24+ hours before:</strong> Full refund</li>
              <li><strong>12-24 hours before:</strong> 50% refund</li>
              <li><strong>Less than 12 hours:</strong> No refund</li>
              <li><strong>No-show:</strong> Full charge</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Cancellation by Provider</h3>
            <p>If a provider cancels:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Customer receives full refund</li>
              <li>Provider may face penalties for frequent cancellations</li>
              <li>Emergency cancellations must be communicated immediately</li>
            </ul>
          </Section>

          <Section title="8. User Conduct" icon={<AlertCircle className="w-5 h-5" />}>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, threaten, or harm other users</li>
              <li>Use the platform for unauthorized commercial purposes</li>
              <li>Attempt to circumvent platform fees</li>
              <li>Engage in price gouging or unfair practices</li>
              <li>Upload viruses or malicious code</li>
              <li>Scrape or collect data without permission</li>
              <li>Create fake accounts or impersonate others</li>
            </ul>
          </Section>

          <Section title="9. Content and Intellectual Property">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">Platform Content</h3>
            <p>
              All content on the platform, including logos, designs, text, and software, is owned by Eve Beauty LLC or its licensors
              and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">User Content</h3>
            <p>By posting content (photos, reviews, messages), you grant Eve Beauty LLC a non-exclusive, worldwide, royalty-free license to use, reproduce, and display that content for platform purposes.</p>
            <p className="mt-3">You retain ownership of your content but are responsible for ensuring you have rights to post it.</p>
          </Section>

          <Section title="10. Reviews and Ratings">
            <ul className="list-disc pl-6 space-y-2">
              <li>Reviews must be honest and based on actual experience</li>
              <li>Fake or incentivized reviews are prohibited</li>
              <li>Eve Beauty reserves the right to remove inappropriate reviews</li>
              <li>Providers cannot pay for positive reviews or removal of negative reviews</li>
              <li>Reviews may not contain profanity, hate speech, or personal attacks</li>
            </ul>
          </Section>

          <Section title="11. Privacy and Data">
            <p>
              Your use of the platform is also governed by our <Link href="/privacy" className="text-[#D97A5F] hover:underline">Privacy Policy</Link>.
              By using Eve Beauty, you consent to our collection and use of your information as described in the Privacy Policy.
            </p>
          </Section>

          <Section title="12. Liability and Disclaimers">
            <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-xl mt-4">
              <p className="font-semibold text-[#92400E] mb-2">Important Legal Notice:</p>
              <p className="text-[#92400E] text-sm">
                Eve Beauty is a platform connecting customers and providers. We do not provide beauty services directly.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Platform Disclaimer</h3>
            <p>The platform is provided "as is" without warranties of any kind. We do not guarantee:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Uninterrupted or error-free service</li>
              <li>Quality of services provided by providers</li>
              <li>Accuracy of provider information</li>
              <li>That defects will be corrected</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Limitation of Liability</h3>
            <p>
              Eve Beauty LLC is not liable for any indirect, incidental, special, or consequential damages arising from your use
              of the platform. Our total liability is limited to the amount you paid to Eve Beauty in the past 12 months.
            </p>
          </Section>

          <Section title="13. Indemnification">
            <p>
              You agree to indemnify and hold harmless Eve Beauty LLC from any claims, damages, losses, or expenses (including legal fees)
              arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Your use of the platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Services provided or received through the platform</li>
            </ul>
          </Section>

          <Section title="14. Termination">
            <p>We may terminate or suspend your account immediately, without notice, for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Harm to other users or the platform</li>
              <li>Extended inactivity</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the platform ceases immediately. Provisions that should survive termination 
              (including liability limitations and indemnification) will remain in effect.
            </p>
          </Section>

          <Section title="15. Dispute Resolution">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">Governing Law</h3>
            <p>These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Arbitration</h3>
            <p>
              Disputes will be resolved through binding arbitration, except for small claims court matters. You waive the right 
              to participate in class action lawsuits.
            </p>
          </Section>

          <Section title="16. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be notified via email or in-app 
              notification at least 30 days before taking effect.
            </p>
            <p className="mt-3">
              Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </Section>

          <Section title="17. Contact Information">
            <p>For questions about these Terms, contact us:</p>
            <div className="mt-4 p-4 bg-[#F7F7F7] rounded-xl space-y-2">
              <p><strong>Email:</strong> <a href="mailto:legal@evebeauty.app" className="text-[#D97A5F] hover:underline">legal@evebeauty.app</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@evebeauty.app" className="text-[#D97A5F] hover:underline">support@evebeauty.app</a></p>
              <p><strong>Company:</strong> Eve Beauty LLC</p>
            </div>
          </Section>

        </div>

        {/* Related Links */}
        <div className="mt-12 text-center">
          <p className="text-[#6B6B6B] mb-6">Related Policies</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/privacy" className="px-6 py-3 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="px-6 py-3 border-2 border-[#E5E5E5] text-[#6B6B6B] rounded-xl font-semibold hover:border-[#D97A5F] hover:text-[#D97A5F] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#E5E5E5] pb-8 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-[#F4B5A4]">{icon}</div>}
        <h2 className="text-2xl font-bold text-[#1A1A1A]">{title}</h2>
      </div>
      <div className="prose prose-gray max-w-none space-y-4 text-[#6B6B6B] leading-relaxed">
        {children}
      </div>
    </section>
  )
}
