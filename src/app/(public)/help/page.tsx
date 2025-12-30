import Link from 'next/link'
import { ArrowLeft, HelpCircle, Search, Book, MessageCircle, User, Package, CreditCard, Shield, Settings, MapPin } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to your questions about using Eve Beauty. Browse FAQs, guides, and support resources.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <Link href="/contact" className="px-4 py-2 bg-[#F4B5A4] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#E89580] transition-colors">
            Contact Support
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FEF5F2] to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">How can we help you?</h1>
          <p className="text-xl text-[#6B6B6B] mb-8">
            Search our knowledge base or browse categories below
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E9E9E]" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <QuickLinkCard 
              title="Customer Help"
              description="Find help with bookings, payments, and account management"
              icon={<User className="w-6 h-6" />}
              href="/customer/help"
              color="from-[#F4B5A4] to-[#E89580]"
            />
            <QuickLinkCard 
              title="Provider Help"
              description="Resources for beauty professionals on our platform"
              icon={<Package className="w-6 h-6" />}
              href="/provider/help"
              color="from-[#3B82F6] to-[#2563EB]"
            />
          </div>

          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CategoryCard 
              icon={<Book className="w-6 h-6" />}
              title="Getting Started"
              topics={['Creating an account', 'Profile setup', 'Platform overview', 'First booking']}
            />
            <CategoryCard 
              icon={<CreditCard className="w-6 h-6" />}
              title="Payments & Billing"
              topics={['Payment methods', 'Refunds & cancellations', 'Pricing & fees', 'Payment security']}
            />
            <CategoryCard 
              icon={<Shield className="w-6 h-6" />}
              title="Safety & Trust"
              topics={['Verification process', 'Safety guidelines', 'Reporting issues', 'Privacy protection']}
            />
            <CategoryCard 
              icon={<Settings className="w-6 h-6" />}
              title="Account Settings"
              topics={['Update profile', 'Notification settings', 'Password reset', 'Delete account']}
            />
            <CategoryCard 
              icon={<MapPin className="w-6 h-6" />}
              title="Services & Bookings"
              topics={['Browse services', 'Booking process', 'Travel fees', 'Service areas']}
            />
            <CategoryCard 
              icon={<MessageCircle className="w-6 h-6" />}
              title="Communication"
              topics={['Messaging providers', 'Notifications', 'Contact support', 'Reviews']}
            />
          </div>
        </div>
      </section>

      {/* Popular FAQs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem 
              question="How do I book a service?"
              answer="Browse services or search for providers in your area. Select a service, choose a date and time, and complete your booking with payment information. You'll receive a confirmation immediately."
            />
            <FAQItem 
              question="What are travel fees?"
              answer="Travel fees depend on the distance between the provider and your location: Free for under 5 miles, $10 for 5-10 miles, $25 for 10-15 miles, and $50 for 15+ miles. These fees are shown before you complete your booking."
            />
            <FAQItem 
              question="Can I cancel or reschedule my booking?"
              answer="Yes! Cancellations made 24+ hours before your appointment receive a full refund. Cancellations 12-24 hours before receive a 50% refund. Cancellations within 12 hours are non-refundable."
            />
            <FAQItem 
              question="Are all providers verified?"
              answer="Yes, all providers go through a verification process including identity verification, background checks, and license verification where applicable. We prioritize safety and trust."
            />
            <FAQItem 
              question="How do payments work?"
              answer="We accept all major credit cards and debit cards. Payments are processed securely through Stripe. You'll be charged when you book, and providers are paid after service completion."
            />
            <FAQItem 
              question="What if I have an issue with my service?"
              answer="If you're not satisfied with your service, contact our support team within 24 hours. We'll work with you to resolve the issue, which may include a refund or rebooking."
            />
            <FAQItem 
              question="How do I become a provider?"
              answer="Sign up as a provider, complete your profile with services and pricing, and submit verification documents. Once approved (typically 1-3 business days), you can start accepting bookings."
            />
            <FAQItem
              question="What fees does Eve Beauty charge?"
              answer="For customers, there are no additional platform fees—you pay only the service price and travel fee. For providers, we charge a 15-20% platform fee per completed booking."
            />
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-3xl p-12 text-center text-white">
            <MessageCircle className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg mb-8 opacity-90">
              Our support team is here to assist you. We typically respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="px-8 py-4 bg-white text-[#1A1A1A] rounded-xl font-bold hover:bg-gray-100 transition-colors">
                Contact Support
              </Link>
              <Link href="/login" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                Start Live Chat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ResourceCard 
              title="Privacy Policy"
              description="Learn how we protect your data"
              href="/privacy"
            />
            <ResourceCard 
              title="Terms of Service"
              description="Understand our platform policies"
              href="/terms"
            />
            <ResourceCard
              title="About Eve Beauty"
              description="Learn about our mission and team"
              href="/about"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function QuickLinkCard({ title, description, icon, href, color }: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{title}</h3>
      <p className="text-[#6B6B6B]">{description}</p>
    </Link>
  )
}

function CategoryCard({ icon, title, topics }: {
  icon: React.ReactNode
  title: string
  topics: string[]
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-[#FEF5F2] rounded-xl flex items-center justify-center text-[#F4B5A4] mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-[#1A1A1A] mb-4">{title}</h3>
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic}>
            <button className="text-[#6B6B6B] hover:text-[#D97A5F] transition-colors text-left">
              {topic}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <summary className="font-bold text-[#1A1A1A] cursor-pointer list-none flex items-center justify-between">
        <span>{question}</span>
        <span className="text-[#F4B5A4] transition-transform group-open:rotate-180">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <p className="text-[#6B6B6B] mt-4 leading-relaxed">{answer}</p>
    </details>
  )
}

function ResourceCard({ title, description, href }: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="bg-[#FEF5F2] rounded-2xl p-6 hover:bg-[#F4B5A4]/20 transition-colors group">
      <h3 className="font-bold text-[#1A1A1A] mb-2 group-hover:text-[#D97A5F] transition-colors">{title}</h3>
      <p className="text-[#6B6B6B]">{description}</p>
    </Link>
  )
}
