'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, CreditCard, Trash2, Star, Loader2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export default function PaymentMethodsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove default from all
      await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', user.id);
      // Set new default
      await supabase.from('payment_methods').update({ is_default: true }).eq('id', id);

      setPaymentMethods(prev => prev.map(pm => ({ ...pm, is_default: pm.id === id })));
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    setDeleting(id);

    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to remove payment method');
    } finally {
      setDeleting(null);
    }
  };

  const getCardIcon = (brand: string) => {
    const colors: Record<string, string> = {
      visa: '#1A1F71',
      mastercard: '#EB001B',
      amex: '#006FCF',
      discover: '#FF6000',
    };
    return <CreditCard className="w-8 h-8" style={{ color: colors[brand.toLowerCase()] || '#6B6B6B' }} />;
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
          <h1 className="text-xl font-bold text-[#1A1A1A]">Payment Methods</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Add New Card Button */}
        <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-dashed border-[#E5E5E5] rounded-2xl p-6 mb-6 hover:border-[#F4B5A4] transition-colors">
          <Plus className="w-6 h-6 text-[#F4B5A4]" />
          <span className="font-semibold text-[#1A1A1A]">Add New Card</span>
        </button>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <CreditCard className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">No Payment Methods</h2>
            <p className="text-[#6B6B6B]">Add a card to make booking payments easier.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                {getCardIcon(pm.brand)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1A1A1A] capitalize">{pm.brand}</p>
                    {pm.is_default && (
                      <span className="bg-[#FCE5DF] text-[#D97A5F] text-xs px-2 py-0.5 rounded-full font-medium">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B6B6B]">•••• {pm.last4} · Expires {pm.exp_month}/{pm.exp_year}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!pm.is_default && (
                    <button onClick={() => handleSetDefault(pm.id)} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors" title="Set as default">
                      <Star className="w-5 h-5 text-[#9E9E9E]" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(pm.id)} disabled={deleting === pm.id} className="p-2 hover:bg-[#FEE2E2] rounded-full transition-colors" title="Remove">
                    {deleting === pm.id ? <Loader2 className="w-5 h-5 animate-spin text-[#EF4444]" /> : <Trash2 className="w-5 h-5 text-[#EF4444]" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

