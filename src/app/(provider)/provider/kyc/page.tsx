'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, Shield, FileText, Camera, Loader2 } from 'lucide-react';

type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface VerificationData {
  status: VerificationStatus;
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export default function KYCVerificationPage() {
  const supabase = createClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [verification, setVerification] = useState<VerificationData>({
    status: 'pending', id_front_url: null, id_back_url: null, selfie_url: null,
    submitted_at: null, reviewed_at: null, rejection_reason: null,
  });

  useEffect(() => {
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from('provider_verifications')
        .select('*')
        .eq('provider_id', user.id)
        .single();

      if (data) setVerification(data);
    } catch (error) {
      console.error('Error fetching verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (type: 'front' | 'back' | 'selfie', file: File) => {
    if (!user) return;
    setUploading(type);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('kyc').getPublicUrl(filePath);

      const fieldName = type === 'front' ? 'id_front_url' : type === 'back' ? 'id_back_url' : 'selfie_url';
      
      // Upsert verification record
      const { error } = await supabase
        .from('provider_verifications')
        .upsert({
          provider_id: user.id,
          [fieldName]: publicUrl,
          status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'provider_id' });

      if (error) throw error;

      setVerification(prev => ({ ...prev, [fieldName]: publicUrl }));
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!verification.id_front_url || !verification.id_back_url || !verification.selfie_url) {
      alert('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('provider_verifications')
        .update({
          status: 'under_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('provider_id', user.id);

      if (error) throw error;
      setVerification(prev => ({ ...prev, status: 'under_review', submitted_at: new Date().toISOString() }));
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (verification.status) {
      case 'approved':
        return <span className="flex items-center gap-2 bg-[#D1FAE5] text-[#10B981] px-4 py-2 rounded-full font-semibold"><CheckCircle className="w-5 h-5" /> Verified</span>;
      case 'under_review':
        return <span className="flex items-center gap-2 bg-[#DBEAFE] text-[#3B82F6] px-4 py-2 rounded-full font-semibold"><Clock className="w-5 h-5" /> Under Review</span>;
      case 'rejected':
        return <span className="flex items-center gap-2 bg-[#FEE2E2] text-[#EF4444] px-4 py-2 rounded-full font-semibold"><XCircle className="w-5 h-5" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-2 bg-[#FEF3C7] text-[#F59E0B] px-4 py-2 rounded-full font-semibold"><Shield className="w-5 h-5" /> Not Verified</span>;
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
          <Link href="/provider/profile" className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Identity Verification</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
          <Shield className="w-16 h-16 text-[#F4B5A4] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Verification Status</h2>
          <div className="flex justify-center mb-4">{getStatusBadge()}</div>
          {verification.status === 'approved' && (
            <p className="text-[#6B6B6B]">Your identity has been verified. Customers can see your verified badge.</p>
          )}
          {verification.status === 'under_review' && (
            <p className="text-[#6B6B6B]">We're reviewing your documents. This usually takes 1-2 business days.</p>
          )}
          {verification.status === 'rejected' && verification.rejection_reason && (
            <div className="bg-[#FEE2E2] text-[#EF4444] p-4 rounded-xl mt-4 text-left">
              <p className="font-semibold mb-1">Rejection Reason:</p>
              <p>{verification.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {(verification.status === 'pending' || verification.status === 'rejected') && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Required Documents</h3>
              <p className="text-sm text-[#6B6B6B] mb-6">Please upload clear photos of your government-issued ID and a selfie for verification.</p>

              {/* ID Front */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#6B6B6B] mb-2">ID Front</label>
                <div onClick={() => frontInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${verification.id_front_url ? 'border-[#10B981] bg-[#D1FAE5]/20' : 'border-[#E5E5E5] hover:border-[#F4B5A4]'}`}>
                  {uploading === 'front' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4B5A4] mx-auto" />
                  ) : verification.id_front_url ? (
                    <div className="flex items-center justify-center gap-2 text-[#10B981]">
                      <CheckCircle className="w-6 h-6" /> <span className="font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <><FileText className="w-8 h-8 text-[#9E9E9E] mx-auto mb-2" /><p className="text-sm text-[#6B6B6B]">Click to upload front of ID</p></>
                  )}
                </div>
                <input ref={frontInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload('front', e.target.files[0])} />
              </div>

              {/* ID Back */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#6B6B6B] mb-2">ID Back</label>
                <div onClick={() => backInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${verification.id_back_url ? 'border-[#10B981] bg-[#D1FAE5]/20' : 'border-[#E5E5E5] hover:border-[#F4B5A4]'}`}>
                  {uploading === 'back' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4B5A4] mx-auto" />
                  ) : verification.id_back_url ? (
                    <div className="flex items-center justify-center gap-2 text-[#10B981]">
                      <CheckCircle className="w-6 h-6" /> <span className="font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <><FileText className="w-8 h-8 text-[#9E9E9E] mx-auto mb-2" /><p className="text-sm text-[#6B6B6B]">Click to upload back of ID</p></>
                  )}
                </div>
                <input ref={backInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload('back', e.target.files[0])} />
              </div>

              {/* Selfie */}
              <div>
                <label className="block text-sm font-medium text-[#6B6B6B] mb-2">Selfie with ID</label>
                <div onClick={() => selfieInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${verification.selfie_url ? 'border-[#10B981] bg-[#D1FAE5]/20' : 'border-[#E5E5E5] hover:border-[#F4B5A4]'}`}>
                  {uploading === 'selfie' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#F4B5A4] mx-auto" />
                  ) : verification.selfie_url ? (
                    <div className="flex items-center justify-center gap-2 text-[#10B981]">
                      <CheckCircle className="w-6 h-6" /> <span className="font-medium">Uploaded</span>
                    </div>
                  ) : (
                    <><Camera className="w-8 h-8 text-[#9E9E9E] mx-auto mb-2" /><p className="text-sm text-[#6B6B6B]">Click to upload selfie holding your ID</p></>
                  )}
                </div>
                <input ref={selfieInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload('selfie', e.target.files[0])} />
              </div>
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} disabled={submitting || !verification.id_front_url || !verification.id_back_url || !verification.selfie_url}
              className="w-full flex items-center justify-center gap-2 bg-[#F4B5A4] text-[#1A1A1A] py-4 rounded-xl font-bold hover:bg-[#E89580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Upload className="w-5 h-5" /> Submit for Verification</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

