import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, FileText } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Eve Beauty collects, uses, and protects your personal information. A service by Eve Beauty LLC.',
}

export default function PrivacyPolicyPage() {
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
            <Shield className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-medium text-[#6B6B6B]">Your Privacy Matters</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">Privacy Policy</h1>
          <p className="text-lg text-[#6B6B6B]">Last updated: December 6, 2024</p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          
          <Section title="Introduction" icon={<FileText className="w-5 h-5" />}>
            <p>
              Welcome to Eve Beauty, operated by Eve Beauty LLC. We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
              our mobile application and website.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the application or website.
            </p>
          </Section>

          <Section title="Information We Collect" icon={<Eye className="w-5 h-5" />}>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-4 mb-3">Personal Information</h3>
            <p>We collect personal information that you voluntarily provide to us when you register on the platform, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Name, email address, and phone number</li>
              <li>Profile information (photo, bio, location)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Identity verification documents (for providers)</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mt-6 mb-3">Automatically Collected Information</h3>
            <p>When you use our platform, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Device information (type, operating system, browser)</li>
              <li>Usage data (pages visited, time spent, interactions)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information" icon={<Lock className="w-5 h-5" />}>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Provide Services:</strong> Process bookings, payments, and facilitate communication between customers and providers</li>
              <li><strong>Account Management:</strong> Create and manage your account, verify identity, and provide customer support</li>
              <li><strong>Improve Platform:</strong> Analyze usage patterns, develop new features, and enhance user experience</li>
              <li><strong>Marketing:</strong> Send promotional emails and notifications (you can opt-out anytime)</li>
              <li><strong>Safety & Security:</strong> Detect fraud, ensure platform security, and comply with legal obligations</li>
              <li><strong>Analytics:</strong> Understand how users interact with our platform to improve services</li>
            </ul>
          </Section>

          <Section title="Information Sharing and Disclosure">
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Service Providers:</strong> When you book a service, providers see your name, contact information, and booking details</li>
              <li><strong>Payment Processors:</strong> Stripe processes payments securely (we don't store full card details)</li>
              <li><strong>Service Partners:</strong> Analytics providers, email services, and cloud hosting (with strict data protection agreements)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-4">
              <strong>We never sell your personal information to third parties.</strong>
            </p>
          </Section>

          <Section title="Data Security">
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
              to protect your information, we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="Your Privacy Rights">
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your information</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@evebeauty.app" className="text-[#D97A5F] hover:underline">privacy@evebeauty.app</a>
            </p>
          </Section>

          <Section title="Cookies and Tracking">
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. 
              You can control cookies through your browser settings.
            </p>
            <p className="mt-3">
              Types of cookies we use:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Essential:</strong> Required for platform functionality</li>
              <li><strong>Analytics:</strong> Help us understand usage patterns</li>
              <li><strong>Preference:</strong> Remember your settings and choices</li>
              <li><strong>Marketing:</strong> Deliver relevant advertisements</li>
            </ul>
            <p className="mt-4">
              Learn more in our <Link href="/cookies" className="text-[#D97A5F] hover:underline">Cookies Policy</Link>.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p>
              Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal
              information from children. If you believe we have collected information from a child, please contact us
              immediately at <a href="mailto:privacy@evebeauty.app" className="text-[#D97A5F] hover:underline">privacy@evebeauty.app</a>.
            </p>
          </Section>

          <Section title="International Data Transfers">
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your information in accordance with this privacy policy.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated 
              "Last updated" date. We will notify you of material changes via email or in-app notification.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              If you have questions or concerns about this privacy policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-[#F7F7F7] rounded-xl space-y-2">
              <p><strong>Email:</strong> <a href="mailto:privacy@evebeauty.app" className="text-[#D97A5F] hover:underline">privacy@evebeauty.app</a></p>
              <p><strong>Support:</strong> <a href="mailto:support@evebeauty.app" className="text-[#D97A5F] hover:underline">support@evebeauty.app</a></p>
              <p><strong>Company:</strong> Eve Beauty LLC</p>
            </div>
          </Section>

        </div>

        {/* Related Links */}
        <div className="mt-12 text-center">
          <p className="text-[#6B6B6B] mb-6">Related Policies</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/terms" className="px-6 py-3 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-semibold hover:bg-[#E89580] transition-colors">
              Terms of Service
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
