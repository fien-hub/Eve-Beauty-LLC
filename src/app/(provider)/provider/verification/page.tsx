'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
  Shield,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react'

type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

interface StatusInfo {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
}

export default function VerificationStatusPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('pending')
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadVerificationData()
  }, [])

  const loadVerificationData = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get provider profile with verification status
      const { data: providerProfile, error: profileError } = await supabase
        .from('provider_profiles')
        .select('identity_verification_status')
        .eq('id', profile.id)
        .single()

      if (profileError) throw profileError

      setVerificationStatus(
        (providerProfile.identity_verification_status as VerificationStatus) ||
          'pending'
      )

      // TODO: Fetch uploaded documents
      // const { data: docs } = await supabase
      //   .from('verification_documents')
      //   .select('*')
      //   .eq('provider_id', profile.id)
      // setDocuments(docs || [])
    } catch (err: any) {
      console.error('Error loading verification data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (): StatusInfo => {
    switch (verificationStatus) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-600" />,
          title: 'Identity Verified',
          description:
            'Your identity has been verified. This helps build trust with customers.',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
        }
      case 'under_review':
        return {
          icon: <Clock className="w-12 h-12 text-blue-600" />,
          title: 'Under Review',
          description:
            'Your documents are being reviewed. This usually takes 1-2 business days.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
        }
      case 'rejected':
        return {
          icon: <XCircle className="w-12 h-12 text-red-600" />,
          title: 'Verification Failed',
          description:
            'Your documents were rejected. Please upload new documents.',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
        }
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-yellow-600" />,
          title: 'Not Verified',
          description:
            'Upload a government-issued ID to verify your identity and increase customer trust.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
        }
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // TODO: Create document record in database
      // const { error: dbError } = await supabase
      //   .from('verification_documents')
      //   .insert({
      //     provider_id: profile.id,
      //     document_type: 'drivers_license',
      //     file_path: fileName,
      //     status: 'pending',
      //   })

      // Update provider status to under_review
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        await supabase
          .from('provider_profiles')
          .update({ identity_verification_status: 'under_review' })
          .eq('id', profile.id)
      }

      alert('Document uploaded successfully! We\'ll review it within 1-2 business days.')
      loadVerificationData()
    } catch (err: any) {
      console.error('Error uploading document:', err)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const statusInfo = getStatusInfo()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D97A5F] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/provider/profile"
              className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                Identity Verification
              </h1>
              <p className="text-sm text-[#6B6B6B]">
                Verify your identity to build trust with customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Card */}
        <div
          className={`${statusInfo.bgColor} border rounded-2xl p-8 mb-8 text-center`}
        >
          <div className="flex justify-center mb-4">{statusInfo.icon}</div>
          <h2 className={`text-2xl font-bold ${statusInfo.color} mb-2`}>
            {statusInfo.title}
          </h2>
          <p className="text-[#6B6B6B]">{statusInfo.description}</p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <h2 className="font-bold text-[#1A1A1A]">
              Why Verify Your Identity?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#F7F7F7] rounded-xl">
              <Users className="w-5 h-5 text-[#D97A5F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#1A1A1A] mb-1">
                  Build Trust
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Customers feel safer booking verified providers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F7F7F7] rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#D97A5F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#1A1A1A] mb-1">
                  Get More Bookings
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Verified providers receive 3x more inquiries
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F7F7F7] rounded-xl">
              <Award className="w-5 h-5 text-[#D97A5F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#1A1A1A] mb-1">
                  Stand Out
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Get a verification badge on your profile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F7F7F7] rounded-xl">
              <Shield className="w-5 h-5 text-[#D97A5F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#1A1A1A] mb-1">
                  Show Legitimacy
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Prove you're a legitimate business
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {(verificationStatus === 'pending' ||
          verificationStatus === 'rejected') && (
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FCE5DF] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#D97A5F]" />
              </div>
              <div>
                <h2 className="font-bold text-[#1A1A1A]">Upload ID Document</h2>
                <p className="text-sm text-[#6B6B6B]">
                  Upload a clear photo of your government-issued ID
                </p>
              </div>
            </div>

            {/* Document Type Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { id: 'drivers_license', icon: '🪪', label: "Driver's License" },
                { id: 'passport', icon: '📘', label: 'Passport' },
                { id: 'national_id', icon: '🆔', label: 'National ID' },
                { id: 'business_license', icon: '📄', label: 'Business License' },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#F7F7F7] rounded-xl text-center cursor-pointer hover:bg-[#FCE5DF] transition-colors"
                >
                  <div className="text-3xl mb-2">{doc.icon}</div>
                  <p className="text-xs font-medium text-[#1A1A1A]">
                    {doc.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <label className="block">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="w-full py-4 bg-[#D97A5F] hover:bg-[#C86A50] disabled:bg-[#E5E5E5] text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Take Photo or Upload Document
                  </>
                )}
              </div>
            </label>

            <p className="mt-4 text-xs text-[#6B6B6B] text-center">
              Accepted formats: JPG, PNG, PDF • Max size: 10MB
            </p>
          </div>
        )}

        {/* Requirements */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Document Requirements</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#6B6B6B]">
                Clear, well-lit photo showing all corners of the document
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#6B6B6B]">
                All text must be readable and not blurry
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#6B6B6B]">
                Document must be valid and not expired
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-[#6B6B6B]">
                Name on document must match your account name
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
