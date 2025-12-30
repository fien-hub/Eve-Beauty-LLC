'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, FileText, HelpCircle, Send, Loader2 } from 'lucide-react';

const faqs = [
  { q: 'How do I book a service?', a: 'Browse providers, select a service, choose a date and time, and complete payment. You\'ll receive a confirmation email with all the details.' },
  { q: 'Can I cancel or reschedule a booking?', a: 'Yes! Go to your bookings page and select the booking you want to modify. Cancellation policies vary by provider.' },
  { q: 'How do payments work?', a: 'We use Stripe for secure payments. Your card is charged when you book. Refunds follow the provider\'s cancellation policy.' },
  { q: 'How do I contact my provider?', a: 'Use the in-app messaging feature to chat directly with your provider before or after booking.' },
  { q: 'What if I\'m not satisfied with a service?', a: 'Contact us within 48 hours of your appointment. We\'ll work with you and the provider to resolve any issues.' },
  { q: 'How do loyalty points work?', a: 'Earn points on every booking. Points can be redeemed for discounts on future services. Check your loyalty page for your balance.' },
  { q: 'Is my payment information secure?', a: 'Yes! We use Stripe, a PCI-compliant payment processor. We never store your full card details on our servers.' },
];

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setForm({ subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/customer/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Help & Support</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <a href="mailto:support@evebeauty.app" className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
            <Mail className="w-8 h-8 text-[#F4B5A4] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1A1A1A]">Email Us</p>
          </a>
          <a href="tel:+18001234567" className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
            <Phone className="w-8 h-8 text-[#F4B5A4] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1A1A1A]">Call Us</p>
          </a>
          <Link href="/customer/messages" className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
            <MessageCircle className="w-8 h-8 text-[#F4B5A4] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1A1A1A]">Live Chat</p>
          </Link>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="p-6 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#F4B5A4]" />
              <h2 className="font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
            </div>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {faqs.map((faq, idx) => (
              <div key={idx} className="px-6">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-4 flex items-center justify-between text-left">
                  <span className="font-medium text-[#1A1A1A] pr-4">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-[#9E9E9E] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#9E9E9E] flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <p className="pb-4 text-[#6B6B6B] text-sm">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#F4B5A4]" />
            <h2 className="font-bold text-[#1A1A1A]">Send Us a Message</h2>
          </div>
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-2">Message Sent!</h3>
              <p className="text-[#6B6B6B]">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-[#D97A5F] font-medium hover:underline">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="What can we help you with?" className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-1">Message</label>
                <textarea value={form.message} onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue or question..." rows={4} className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none transition-colors resize-none" />
              </div>
              <button type="submit" disabled={sending || !form.subject || !form.message}
                className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors disabled:opacity-50">
                {sending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Message</>}
              </button>
            </form>
          )}
        </div>

        {/* Legal Links */}
        <div className="flex justify-center gap-6 text-sm text-[#6B6B6B]">
          <Link href="/terms" className="hover:text-[#D97A5F]">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-[#D97A5F]">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

