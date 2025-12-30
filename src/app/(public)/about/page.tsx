import Link from 'next/link'
import { ArrowLeft, Sparkles, Target, Users, Heart, Award, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Eve Beauty\'s mission to connect beauty professionals with customers seeking quality services. A service by Eve Beauty LLC.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FEF5F2] to-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] mb-6">
            Bringing Beauty<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97A5F] to-[#E89580]">
              To Your Doorstep
            </span>
          </h1>
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto leading-relaxed">
            Eve Beauty is revolutionizing the beauty industry by connecting skilled professionals with customers
            who deserve convenient, high-quality services in the comfort of their own homes. A service by Eve Beauty LLC.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <ValueCard 
              icon={<Target className="w-8 h-8" />}
              title="Our Mission"
              description="To empower beauty professionals and make premium beauty services accessible to everyone, everywhere. We believe that everyone deserves to feel beautiful and confident."
              color="from-[#F4B5A4] to-[#E89580]"
            />
            <ValueCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Our Vision"
              description="To become the world's most trusted platform for on-demand beauty services, creating opportunities for professionals and convenience for customers globally."
              color="from-[#3B82F6] to-[#2563EB]"
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1A1A1A] text-center mb-12">Our Story</h2>
          <div className="prose prose-lg max-w-none space-y-6 text-[#6B6B6B]">
            <p>
              Eve Beauty was born from a simple idea: beauty services should be convenient, accessible, and empowering.
              Our founders, having experienced the frustration of scheduling conflicts and long salon waits, envisioned
              a platform that would bring professional beauty services directly to customers&apos; homes.
            </p>
            <p>
              What started as a small team in 2023 has grown into a thriving marketplace connecting thousands of
              skilled beauty professionals with customers across the country. We&apos;ve facilitated over 100,000 bookings,
              helped providers grow their businesses, and made beauty services more accessible than ever before.
            </p>
            <p>
              Today, Eve Beauty is more than just a booking platform—it&apos;s a community of passionate beauty professionals
              and satisfied customers who believe in the power of convenience, quality, and trust.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1A1A1A] text-center mb-4">Our Values</h2>
          <p className="text-xl text-[#6B6B6B] text-center mb-16">
            The principles that guide everything we do
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <ValuePillar 
              icon={<Users className="w-8 h-8" />}
              title="Community First"
              description="We prioritize the needs of our beauty professionals and customers, fostering a supportive and inclusive community."
            />
            <ValuePillar 
              icon={<Award className="w-8 h-8" />}
              title="Quality & Excellence"
              description="We maintain high standards by verifying all professionals and ensuring every service meets our quality criteria."
            />
            <ValuePillar 
              icon={<Heart className="w-8 h-8" />}
              title="Trust & Safety"
              description="We invest heavily in safety measures, background checks, and secure payments to protect everyone on our platform."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#F4B5A4] to-[#E89580]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Eve Beauty by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="10,000+" label="Active Customers" />
            <Stat number="2,500+" label="Verified Providers" />
            <Stat number="100,000+" label="Services Booked" />
            <Stat number="4.9/5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1A1A1A] text-center mb-4">Meet Our Team</h2>
          <p className="text-xl text-[#6B6B6B] text-center mb-16">
            Passionate people working to transform the beauty industry
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'CEO & Co-Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
              { name: 'Michael Chen', role: 'CTO & Co-Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
              { name: 'Emily Rodriguez', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
              { name: 'David Kim', role: 'Head of Growth', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop' },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">{member.name}</h3>
                <p className="text-sm text-[#6B6B6B]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-6">Join the Eve Beauty Community</h2>
          <p className="text-xl text-[#6B6B6B] mb-10">
            Whether you're a beauty professional looking to grow your business or a customer seeking quality services, 
            we'd love to have you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=provider" className="px-8 py-4 bg-[#F4B5A4] text-[#1A1A1A] rounded-xl font-bold hover:bg-[#E89580] transition-colors">
              Become a Provider
            </Link>
            <Link href="/signup" className="px-8 py-4 border-2 border-[#E5E5E5] text-[#6B6B6B] rounded-xl font-bold hover:border-[#D97A5F] hover:text-[#D97A5F] transition-colors">
              Sign Up as Customer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ValueCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow">
      <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-6`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4">{title}</h3>
      <p className="text-[#6B6B6B] leading-relaxed">{description}</p>
    </div>
  )
}

function ValuePillar({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-[#F4B5A4] to-[#E89580] rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{title}</h3>
      <p className="text-[#6B6B6B] leading-relaxed">{description}</p>
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-white mb-2">{number}</p>
      <p className="text-white/80">{label}</p>
    </div>
  )
}
