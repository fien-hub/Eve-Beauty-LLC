'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Receipt, Download, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  payment_method_brand: string;
  payment_method_last4: string;
  booking: {
    id: string;
    service: { name: string };
    provider: { business_name: string };
  };
}

export default function PaymentHistoryPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payments')
        .select(`
          id, amount, status, created_at, payment_method_brand, payment_method_last4,
          booking:bookings(id, provider_services(services(name)), provider:provider_profiles!bookings_provider_id_fkey(business_name))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Transform data to match Payment interface (Supabase returns arrays for relations)
      const transformedPayments = (data || []).map((payment: any) => {
        const booking = Array.isArray(payment.booking) ? payment.booking[0] : payment.booking
        return {
          ...payment,
          booking: booking ? {
            id: booking.id,
            service: Array.isArray(booking.service) ? booking.service[0] : booking.service,
            provider: Array.isArray(booking.provider) ? booking.provider[0] : booking.provider
          } : null
        }
      });
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <span className="flex items-center gap-1 text-[#10B981] text-sm"><CheckCircle className="w-4 h-4" /> Paid</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-[#F59E0B] text-sm"><Clock className="w-4 h-4" /> Pending</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-[#EF4444] text-sm"><XCircle className="w-4 h-4" /> Failed</span>;
      case 'refunded':
        return <span className="flex items-center gap-1 text-[#6B6B6B] text-sm"><Receipt className="w-4 h-4" /> Refunded</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4B5A4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/customer/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Payment History</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Receipt className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">No Payments Yet</h2>
            <p className="text-[#6B6B6B]">Your payment history will appear here after your first booking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{payment.booking?.service?.name || 'Service'}</p>
                    <p className="text-sm text-[#6B6B6B]">{payment.booking?.provider?.business_name || 'Provider'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1A1A1A]">${(payment.amount / 100).toFixed(2)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <CreditCard className="w-4 h-4" />
                    <span className="capitalize">{payment.payment_method_brand}</span>
                    <span>•••• {payment.payment_method_last4}</span>
                  </div>
                  <p className="text-sm text-[#9E9E9E]">{format(new Date(payment.created_at), 'MMM d, yyyy')}</p>
                </div>
                {payment.status === 'succeeded' && (
                  <button className="flex items-center gap-2 text-[#D97A5F] text-sm font-medium mt-3 hover:underline">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

