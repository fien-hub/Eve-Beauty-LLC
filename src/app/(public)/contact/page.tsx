import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MessageCircle, MapPin, Send, Loader2, CheckCircle } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Eve Beauty\'s support team. We\'re here to help!',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-medium text-[#6B6B6B]">We're Here to Help</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Get in Touch</h1>
          <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <ContactMethod
                  icon={<Mail className="w-5 h-5" />}
                  title="Email Us"
                  value="support@evebeauty.app"
                  href="mailto:support@evebeauty.app"
                />
                
                <ContactMethod 
                  icon={<Phone className="w-5 h-5" />}
                  title="Call Us"
                  value="+1 (800) 123-4567"
                  href="tel:+18001234567"
                />
                
                <ContactMethod 
                  icon={<MessageCircle className="w-5 h-5" />}
                  title="Live Chat"
                  value="Available 9AM - 6PM EST"
                  href="/login"
                  linkText="Start Chat"
                />
                
                <ContactMethod 
                  icon={<MapPin className="w-5 h-5" />}
                  title="Visit Us"
                  value="123 Beauty Street, San Francisco, CA 94102"
                />
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Office Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Monday - Friday</span>
                  <span className="font-medium text-[#1A1A1A]">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Saturday</span>
                  <span className="font-medium text-[#1A1A1A]">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Sunday</span>
                  <span className="font-medium text-[#1A1A1A]">Closed</span>
                </div>
                <p className="text-xs text-[#9E9E9E] mt-4">All times are in Eastern Standard Time (EST)</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/help" className="block text-[#6B6B6B] hover:text-[#D97A5F] transition-colors">
                  Help Center
                </Link>
                <Link href="/customer/help" className="block text-[#6B6B6B] hover:text-[#D97A5F] transition-colors">
                  Customer Support
                </Link>
                <Link href="/privacy" className="block text-[#6B6B6B] hover:text-[#D97A5F] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-[#6B6B6B] hover:text-[#D97A5F] transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <FAQItem 
              question="How quickly will I get a response?"
              answer="We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support line."
            />
            <FAQItem 
              question="Can I track my support ticket?"
              answer="Yes! After submitting a request, you'll receive a confirmation email with a ticket number. You can reply to that email for updates."
            />
            <FAQItem 
              question="Do you offer phone support?"
              answer="Absolutely! Our phone support is available Monday through Friday, 9 AM to 6 PM EST. Call us at +1 (800) 123-4567."
            />
            <FAQItem 
              question="What if I need help outside business hours?"
              answer="You can submit a request anytime through this form or email us. We'll respond as soon as we're back online."
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function ContactForm() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Send us a Message</h2>
      <form className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">First Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Last Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Email Address *</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Phone Number (Optional)</label>
          <input
            type="tel"
            className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Subject *</label>
          <select
            required
            className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors"
          >
            <option value="">Select a topic</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="billing">Billing & Payments</option>
            <option value="provider">Provider Questions</option>
            <option value="safety">Safety & Trust</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Partnership Opportunities</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Message *</label>
          <textarea
            required
            rows={6}
            className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors resize-none"
            placeholder="Tell us how we can help you..."
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors"
        >
          <Send className="w-5 h-5" />
          Send Message
        </button>

        <p className="text-sm text-[#9E9E9E] text-center">
          By submitting this form, you agree to our <Link href="/privacy" className="text-[#D97A5F] hover:underline">Privacy Policy</Link>
        </p>
      </form>
    </div>
  )
}

function ContactMethod({ icon, title, value, href, linkText }: {
  icon: React.ReactNode
  title: string
  value: string
  href?: string
  linkText?: string
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-[#E5E5E5] last:border-0 last:pb-0">
      <div className="w-10 h-10 bg-[#FEF5F2] rounded-xl flex items-center justify-center text-[#F4B5A4] flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#9E9E9E] mb-1">{title}</p>
        {href ? (
          <a href={href} className="text-[#1A1A1A] hover:text-[#D97A5F] transition-colors font-medium">
            {linkText || value}
          </a>
        ) : (
          <p className="text-[#1A1A1A] font-medium">{value}</p>
        )}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-[#1A1A1A] mb-3">{question}</h3>
      <p className="text-[#6B6B6B] leading-relaxed">{answer}</p>
    </div>
  )
}
