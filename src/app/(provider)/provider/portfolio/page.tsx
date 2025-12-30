'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, LoadingState, EmptyPortfolio, ImageGallery, Modal, Button } from '@/components/ui'
import { Image as ImageIcon, Plus, Trash2, Edit, X, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PortfolioItem {
  id: string
  image_url: string
  caption: string | null
  tags: string[]
  is_before_after: boolean
  before_image_url?: string | null
  created_at: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ caption: '', tags: '', isBeforeAfter: false })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      setItems(data || [])
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upload main image
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, selectedFile)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(fileName)

      // Upload before image if before/after
      let beforeUrl = null
      if (uploadForm.isBeforeAfter && beforeFile) {
        const beforeFileName = `${user.id}/${Date.now()}_before.${beforeFile.name.split('.').pop()}`
        await supabase.storage.from('portfolio').upload(beforeFileName, beforeFile)
        const { data: { publicUrl: beforePublicUrl } } = supabase.storage.from('portfolio').getPublicUrl(beforeFileName)
        beforeUrl = beforePublicUrl
      }

      // Save to database
      const { data: newItem, error } = await supabase.from('portfolio_items').insert({
        provider_id: user.id,
        image_url: publicUrl,
        caption: uploadForm.caption || null,
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_before_after: uploadForm.isBeforeAfter,
        before_image_url: beforeUrl,
      }).select().single()

      if (error) throw error
      if (newItem) setItems([newItem, ...items])

      setShowUploadModal(false)
      setSelectedFile(null)
      setBeforeFile(null)
      setUploadForm({ caption: '', tags: '', isBeforeAfter: false })
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return
    try {
      await supabase.from('portfolio_items').delete().eq('id', id)
      setItems(items.filter(i => i.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  if (loading) return <LoadingState message="Loading portfolio..." />

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEF5F2] rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#D97A5F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Portfolio</h1>
              <p className="text-sm text-[#6B6B6B]">{items.length} items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/provider/posts/new" className="flex items-center gap-2 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all">
              <Sparkles className="w-4 h-4" /> Create Post
            </Link>
            <Button onClick={() => setShowUploadModal(true)} variant="outline"><Plus className="w-4 h-4 mr-2" />Add Work</Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <EmptyPortfolio />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#F0F0F0]">
                  <Image src={item.image_url} alt={item.caption || 'Portfolio'} fill className="object-cover" />
                </div>
                {item.is_before_after && <Badge className="absolute top-2 left-2 bg-[#F4B5A4] text-white">Before/After</Badge>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-full hover:bg-[#FEE2E2] transition-colors">
                    <Trash2 className="w-5 h-5 text-[#EF4444]" />
                  </button>
                </div>
                {item.caption && <p className="text-sm text-[#6B6B6B] mt-2 truncate">{item.caption}</p>}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Add Portfolio Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="beforeAfter" checked={uploadForm.isBeforeAfter} onChange={(e) => setUploadForm({ ...uploadForm, isBeforeAfter: e.target.checked })} />
            <label htmlFor="beforeAfter" className="text-sm">This is a before/after comparison</label>
          </div>
          {uploadForm.isBeforeAfter && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Before Image</label>
              <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Caption</label>
            <input type="text" value={uploadForm.caption} onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })} placeholder="Describe your work" className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Tags (comma separated)</label>
            <input type="text" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} placeholder="hair, color, balayage" className="w-full px-4 py-2 border-2 border-[#E5E5E5] rounded-xl focus:border-[#F4B5A4] focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleUpload} isLoading={uploading} disabled={!selectedFile} className="flex-1">Upload</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

