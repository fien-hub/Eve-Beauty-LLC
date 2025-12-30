import Link from 'next/link'
import { ArrowLeft, Cookie, Eye, Settings, Shield, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how Eve Beauty uses cookies and similar technologies to improve your experience.',
}

export default function CookiesPage() {
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
            <Cookie className="w-5 h-5 text-[#F4B5A4]" />
            <span className="text-sm font-medium text-[#6B6B6B]">Updated: January 2025</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">Cookie Policy</h1>
          <p className="text-xl text-[#6B6B6B]">
            Last updated: January 15, 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 space-y-12">
          <Section title="What Are Cookies?" icon={<Cookie className="w-6 h-6" />}>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide 
              you with a better experience by remembering your preferences, understanding how you use our platform, and 
              improving our services.
            </p>
            <p>
              We use both first-party cookies (set by Eve Beauty) and third-party cookies (set by our partners and service
              providers) to enhance your experience on our platform.
            </p>
          </Section>

          <Section title="Types of Cookies We Use" icon={<Settings className="w-6 h-6" />}>
            <CookieType 
              name="Essential Cookies"
              description="These cookies are necessary for the website to function and cannot be disabled. They enable core functionality such as security, network management, and accessibility."
              examples={['Authentication tokens', 'Session management', 'Security verification']}
              duration="Session or persistent (up to 1 year)"
              canOptOut={false}
            />
            
            <CookieType 
              name="Performance Cookies"
              description="These cookies collect information about how you use our website, helping us improve performance and user experience."
              examples={['Page load times', 'Error tracking', 'Feature usage analytics']}
              duration="Up to 2 years"
              canOptOut={true}
            />
            
            <CookieType 
              name="Functional Cookies"
              description="These cookies allow us to remember your choices and preferences to provide enhanced, personalized features."
              examples={['Language preferences', 'Location settings', 'Display preferences']}
              duration="Up to 2 years"
              canOptOut={true}
            />
            
            <CookieType 
              name="Targeting/Advertising Cookies"
              description="These cookies track your browsing habits to deliver relevant advertisements and measure campaign effectiveness."
              examples={['Ad preferences', 'Marketing campaigns', 'Social media integration']}
              duration="Up to 2 years"
              canOptOut={true}
            />
          </Section>

          <Section title="Specific Cookies We Use" icon={<Eye className="w-6 h-6" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#E5E5E5]">
                    <th className="py-3 pr-4 font-bold text-[#1A1A1A]">Cookie Name</th>
                    <th className="py-3 pr-4 font-bold text-[#1A1A1A]">Purpose</th>
                    <th className="py-3 font-bold text-[#1A1A1A]">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-[#6B6B6B]">
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-3 pr-4 font-mono text-sm">auth_token</td>
                    <td className="py-3 pr-4">Authenticates your session</td>
                    <td className="py-3">Session</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-3 pr-4 font-mono text-sm">user_preferences</td>
                    <td className="py-3 pr-4">Stores your settings</td>
                    <td className="py-3">1 year</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-3 pr-4 font-mono text-sm">_ga</td>
                    <td className="py-3 pr-4">Google Analytics tracking</td>
                    <td className="py-3">2 years</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-3 pr-4 font-mono text-sm">_fbp</td>
                    <td className="py-3 pr-4">Facebook Pixel tracking</td>
                    <td className="py-3">3 months</td>
                  </tr>
                  <tr className="border-b border-[#E5E5E5]">
                    <td className="py-3 pr-4 font-mono text-sm">location</td>
                    <td className="py-3 pr-4">Remembers your location</td>
                    <td className="py-3">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Third-Party Cookies" icon={<ExternalLink className="w-6 h-6" />}>
            <p>
              We work with trusted third-party services that may set cookies on your device:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google Analytics:</strong> Helps us understand how visitors use our website
              </li>
              <li>
                <strong>Stripe:</strong> Processes payments securely
              </li>
              <li>
                <strong>Facebook Pixel:</strong> Measures advertising effectiveness
              </li>
              <li>
                <strong>Supabase:</strong> Manages authentication and database services
              </li>
              <li>
                <strong>Vercel:</strong> Hosts and serves our website
              </li>
            </ul>
            <p className="mt-4">
              These third parties have their own privacy policies governing their use of cookies. We encourage you to 
              review their policies.
            </p>
          </Section>

          <Section title="Managing Your Cookie Preferences" icon={<Settings className="w-6 h-6" />}>
            <p>
              You have several options to manage cookies:
            </p>
            
            <div className="mt-6 space-y-4">
              <PreferenceOption 
                title="Browser Settings"
                description="Most browsers allow you to control cookies through their settings. You can set your browser to block or delete cookies."
              />
              
              <PreferenceOption 
                title="Cookie Consent Manager"
                description="When you first visit our website, you can choose which types of cookies to accept through our consent banner."
              />
              
              <PreferenceOption 
                title="Opt-Out Tools"
                description="You can opt out of targeted advertising through the Digital Advertising Alliance (DAA) or Network Advertising Initiative (NAI)."
              />
            </div>

            <div className="mt-6 p-4 bg-[#FEF5F2] border-l-4 border-[#F4B5A4] rounded">
              <p className="text-sm text-[#6B6B6B]">
                <strong className="text-[#1A1A1A]">Note:</strong> Blocking or deleting cookies may affect your experience 
                on our website and some features may not function properly.
              </p>
            </div>
          </Section>

          <Section title="Mobile App Tracking" icon={<Shield className="w-6 h-6" />}>
            <p>
              Our mobile apps use similar tracking technologies, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device identifiers (IDFA for iOS, Advertising ID for Android)</li>
              <li>Analytics SDKs (Google Analytics, Firebase)</li>
              <li>Crash reporting tools</li>
              <li>Push notification tokens</li>
            </ul>
            <p className="mt-4">
              You can manage these through your device's privacy settings or by adjusting permissions within the app.
            </p>
          </Section>

          <Section title="Do Not Track Signals" icon={<Eye className="w-6 h-6" />}>
            <p>
              Some browsers support "Do Not Track" (DNT) signals. Currently, there is no industry standard for responding 
              to DNT signals, and we do not alter our data collection practices when we receive DNT signals from browsers.
            </p>
            <p>
              However, you can still manage your cookie preferences through the methods described above.
            </p>
          </Section>

          <Section title="Updates to This Policy" icon={<Cookie className="w-6 h-6" />}>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the updated policy on our website and updating the 
              "Last updated" date.
            </p>
            <p>
              We encourage you to review this policy periodically to stay informed about how we use cookies.
            </p>
          </Section>

          <Section title="Contact Us" icon={<Shield className="w-6 h-6" />}>
            <p>
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 p-6 bg-[#F7F7F7] rounded-xl space-y-2">
              <p><strong>Email:</strong> privacy@evebeauty.app</p>
              <p><strong>Company:</strong> Eve Beauty LLC</p>
            </div>
          </Section>

          {/* CTAs */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/privacy" className="flex-1 px-6 py-4 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-bold text-center hover:bg-[#E89580] transition-colors">
              View Privacy Policy
            </Link>
            <Link href="/contact" className="flex-1 px-6 py-4 border-2 border-[#E5E5E5] text-[#6B6B6B] rounded-xl font-bold text-center hover:border-[#D97A5F] hover:text-[#D97A5F] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, icon, children }: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
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

function CookieType({ name, description, examples, duration, canOptOut }: {
  name: string
  description: string
  examples: string[]
  duration: string
  canOptOut: boolean
}) {
  return (
    <div className="mt-6 p-6 bg-[#F7F7F7] rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-[#1A1A1A]">{name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${canOptOut ? 'bg-[#FEF5F2] text-[#D97A5F]' : 'bg-[#E5E5E5] text-[#6B6B6B]'}`}>
          {canOptOut ? 'Can opt-out' : 'Required'}
        </span>
      </div>
      <p className="text-[#6B6B6B] mb-3">{description}</p>
      <div className="space-y-2">
        <p className="text-sm"><strong className="text-[#1A1A1A]">Examples:</strong> {examples.join(', ')}</p>
        <p className="text-sm"><strong className="text-[#1A1A1A]">Duration:</strong> {duration}</p>
      </div>
    </div>
  )
}

function PreferenceOption({ title, description }: {
  title: string
  description: string
}) {
  return (
    <div className="p-4 bg-[#F7F7F7] rounded-xl">
      <h4 className="font-bold text-[#1A1A1A] mb-2">{title}</h4>
      <p className="text-[#6B6B6B]">{description}</p>
    </div>
  )
}
