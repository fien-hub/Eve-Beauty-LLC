import Link from 'next/link'
import Image from 'next/image'
import { Star, Shield, Home, CreditCard, Clock, MapPin, Sparkles, Smartphone, Download } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF5F2] via-white to-[#FCE5DF]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Eve Beauty Logo"
              width={40}
              height={40}
              className="rounded-xl shadow-md"
            />
            <span className="text-2xl font-bold text-[#D97A5F]">Eve Beauty</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#6B6B6B] hover:text-[#D97A5F] transition-colors font-medium">Features</a>
            <a href="#services" className="text-[#6B6B6B] hover:text-[#D97A5F] transition-colors font-medium">Services</a>
            <a href="#download" className="text-[#6B6B6B] hover:text-[#D97A5F] transition-colors font-medium">Download</a>
            <a
              href="#download"
              className="bg-[#F4B5A4] text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-[#E89580] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Get the App
            </a>
          </nav>
          {/* Mobile menu button */}
          <a href="#download" className="md:hidden bg-[#F4B5A4] text-black px-4 py-2 rounded-xl font-semibold">
            Get App
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
                <Smartphone className="w-4 h-4 text-[#D97A5F]" />
                <span className="text-sm font-medium text-[#6B6B6B]">Now available on iOS & Android</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
                Beauty Services<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D97A5F] to-[#E89580]">At Your Doorstep</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#6B6B6B] mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with verified beauty professionals who come to you.
                Nails, hair, makeup, skincare, and more — all from the comfort of your home.
              </p>

              {/* App Download Buttons - Primary CTA */}
              <div className="mb-8">
                <p className="text-sm text-[#6B6B6B] mb-4 font-medium">Download the app to get started</p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <a
                    href="https://apps.apple.com/app/evebeauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs leading-tight opacity-80">Download on the</div>
                      <div className="text-lg font-semibold leading-tight">App Store</div>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.evebeauty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs leading-tight opacity-80">GET IT ON</div>
                      <div className="text-lg font-semibold leading-tight">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                  <span>Verified Pros</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                  <span>Secure Pay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span>4.9 Rating</span>
                </div>
              </div>
            </div>

            {/* Hero Image Grid */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop"
                      alt="Professional hair styling"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop"
                      alt="Makeup application"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop"
                      alt="Nail art design"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=500&fit=crop"
                      alt="Skincare treatment"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Floating stats card */}
              <div className="absolute -left-4 bottom-20 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                    <Download className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">10,000+</p>
                    <p className="text-sm text-[#6B6B6B]">App Downloads</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97A5F] font-semibold text-sm uppercase tracking-wider mb-4">Why Eve Beauty</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Beauty Made Simple
            </h2>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto">
              We connect you with verified professionals for a seamless beauty experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Professionals',
                description: 'All providers are background-checked and verified for your safety and peace of mind.',
                color: 'bg-[#D1FAE5]',
                iconColor: 'text-[#10B981]',
              },
              {
                icon: Home,
                title: 'Home Service',
                description: 'Skip the salon. Get professional beauty services delivered to your doorstep.',
                color: 'bg-[#FCE5DF]',
                iconColor: 'text-[#D97A5F]',
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                description: 'Pay securely through the app with multiple payment options. No cash needed.',
                color: 'bg-[#DBEAFE]',
                iconColor: 'text-[#3B82F6]',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group text-center p-8 rounded-3xl bg-[#FEF5F2] hover:bg-white hover:shadow-2xl hover:shadow-[#F4B5A4]/10 transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-[#FCE5DF]"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1A1A1A]">{feature.title}</h3>
                <p className="text-[#6B6B6B] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Additional features row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-[#E5E5E5]">
            {[
              { icon: Clock, text: 'Book in 60 seconds' },
              { icon: MapPin, text: 'Providers near you' },
              { icon: Star, text: '4.9 average rating' },
              { icon: Shield, text: 'Satisfaction guaranteed' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-[#FEF5F2] rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#D97A5F]" />
                </div>
                <span className="text-sm font-medium text-[#6B6B6B]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97A5F] font-semibold text-sm uppercase tracking-wider mb-4">Services</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Popular Categories
            </h2>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto">
              From nails to skincare, find the perfect service in the app
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: '💅', name: 'Nails', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop', providers: '120+' },
              { icon: '💇', name: 'Hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop', providers: '85+' },
              { icon: '💄', name: 'Makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop', providers: '65+' },
              { icon: '✨', name: 'Skincare', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop', providers: '50+' },
              { icon: '💆', name: 'Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop', providers: '40+' },
              { icon: '🌸', name: 'Waxing', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop', providers: '35+' },
            ].map((service) => (
              <div
                key={service.name}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <Image
                  src={service.image}
                  alt={`${service.name} services`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-4xl mb-2">{service.icon}</span>
                  <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-white/80 text-sm">{service.providers} providers</p>
                </div>
              </div>
            ))}
          </div>
          {/* CTA to download */}
          <div className="text-center mt-12">
            <p className="text-[#6B6B6B] mb-4">Download the app to browse all services and book appointments</p>
            <a
              href="#download"
              className="inline-flex items-center gap-2 bg-[#F4B5A4] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#E89580] transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Get the App
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#D97A5F] font-semibold text-sm uppercase tracking-wider mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Loved by Thousands
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', role: 'Customer', avatar: 'SM', text: 'Eve Beauty has transformed my self-care routine. The convenience of having a professional come to my home is unmatched!', rating: 5 },
              { name: 'Jessica L.', role: 'Nail Artist', avatar: 'JL', text: 'As a provider, Eve Beauty helped me grow my client base by 3x. The platform is easy to use and payments are always on time.', rating: 5 },
              { name: 'Emily R.', role: 'Customer', avatar: 'ER', text: 'I\'ve tried many beauty apps, but Eve Beauty stands out with its verified professionals and excellent customer service.', rating: 5 },
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#FEF5F2] p-8 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-[#6B6B6B] mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F4B5A4] to-[#E89580] flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{testimonial.name}</p>
                    <p className="text-sm text-[#9E9E9E]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4B5A4] via-[#E89580] to-[#D97A5F]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Smartphone className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Available on iOS & Android</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Download the App
          </h2>
          <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
            Get Eve Beauty on your phone for the best experience. Book appointments, chat with providers, and manage everything on the go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://apps.apple.com/app/evebeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#FEF5F2] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs leading-tight opacity-70">Download on the</div>
                <div className="text-lg font-semibold leading-tight">App Store</div>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.evebeauty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#FEF5F2] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs leading-tight opacity-70">GET IT ON</div>
                <div className="text-lg font-semibold leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-[#9E9E9E] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Eve Beauty Logo"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span className="text-2xl font-bold text-[#F4B5A4]">Eve Beauty</span>
              </div>
              <p className="text-sm mb-6 max-w-sm">
                Beauty services at your doorstep. Connect with verified professionals and book your next appointment through our mobile app. A service by Eve Beauty LLC.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'Facebook'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 bg-[#333] rounded-xl flex items-center justify-center hover:bg-[#F4B5A4] transition-colors">
                    <span className="text-xs font-medium text-white">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-[#F4B5A4] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#F4B5A4] transition-colors">Contact</Link></li>
                <li><a href="mailto:support@evebeauty.app" className="hover:text-[#F4B5A4] transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Get the App</h5>
              <div className="space-y-3">
                <a
                  href="https://apps.apple.com/app/evebeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-[#F4B5A4] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.evebeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-[#F4B5A4] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 Eve Beauty LLC. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="hover:text-[#F4B5A4] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[#F4B5A4] transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-[#F4B5A4] transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
