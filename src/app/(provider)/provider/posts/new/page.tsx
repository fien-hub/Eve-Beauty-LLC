'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Sparkles, Hash, Tag, ImageIcon, Check, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: number;
}

export default function CreatePostPage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!provider) { router.push('/provider/onboarding'); return; }
    setProviderId(provider.id);
    
    const { data: servicesData } = await supabase
      .from('provider_services')
      .select('id, services(name), base_price')
      .eq('provider_id', provider.id);
    
    setServices((servicesData || []).map((s: any) => ({
      id: s.id,
      name: s.services?.name || 'Service',
      price: s.base_price
    })));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const handleSubmit = async () => {
    if (!selectedImage || !providerId || !selectedService) return;
    
    setUploading(true);
    try {
      // Upload image
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${providerId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, selectedImage);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(fileName);
      
      // Create post
      const { error: postError } = await supabase.from('portfolio_items').insert({
        provider_id: providerId,
        image_url: publicUrl,
        caption,
        service_id: selectedService,
        is_visible: true
      });
      
      if (postError) throw postError;
      
      router.push('/provider/portfolio');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="flex items-center gap-2 text-[#6B6B6B]">
            <ArrowLeft className="w-5 h-5" /> {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <h1 className="font-bold text-[#1A1A1A]">Create Post</h1>
          {step === 3 ? (
            <button onClick={handleSubmit} disabled={uploading || !selectedService} className="flex items-center gap-2 bg-gradient-to-r from-[#F4B5A4] to-[#E89580] text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {uploading ? 'Posting...' : 'Post'}
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && !selectedImage} className="text-[#D97A5F] font-semibold disabled:opacity-50">
              Next
            </button>
          )}
        </div>
        {/* Step Indicator */}
        <div className="flex gap-1 px-4 pb-3">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-[#F4B5A4]' : 'bg-[#E5E5E5]'}`} />
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Select Image */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Select your best work</h2>
              <p className="text-[#6B6B6B]">Share your portfolio with potential clients</p>
            </div>

            {imagePreview ? (
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-white rounded-3xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center gap-4 hover:border-[#D97A5F] transition-colors">
                <div className="w-20 h-20 bg-[#FEF5F2] rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-[#D97A5F]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">Tap to upload</p>
                  <p className="text-sm text-[#6B6B6B]">JPG, PNG up to 10MB</p>
                </div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>
        )}

        {/* Step 2: Add Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Add details</h2>
              <p className="text-[#6B6B6B]">Help clients discover your work</p>
            </div>

            {/* Caption */}
            <div className="bg-white rounded-2xl p-4">
              <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Caption</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe your work..." className="w-full h-24 resize-none border-0 focus:ring-0 text-[#1A1A1A] placeholder:text-[#9E9E9E]" maxLength={500} />
              <p className="text-xs text-[#9E9E9E] text-right">{caption.length}/500</p>
            </div>

            {/* Hashtags */}
            <div className="bg-white rounded-2xl p-4">
              <label className="text-sm font-semibold text-[#1A1A1A] mb-2 flex items-center gap-2"><Hash className="w-4 h-4" /> Hashtags</label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {hashtags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-[#FEF5F2] text-[#D97A5F] px-3 py-1.5 rounded-lg text-sm font-medium">
                    #{tag}
                    <button onClick={() => removeHashtag(tag)}><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={hashtagInput} onChange={e => setHashtagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())} placeholder="Add hashtag" className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-xl focus:border-[#D97A5F] focus:ring-0" />
                <button onClick={addHashtag} className="px-4 py-2 bg-[#F7F7F7] rounded-xl font-medium hover:bg-[#E5E5E5]">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tag Service */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Tag a service</h2>
              <p className="text-[#6B6B6B]">Let clients book directly from your post</p>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {imagePreview && (
                <div className="relative aspect-video">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <p className="text-[#1A1A1A] line-clamp-2">{caption || 'No caption'}</p>
                {hashtags.length > 0 && (
                  <p className="text-[#D97A5F] text-sm mt-2">{hashtags.map(t => `#${t}`).join(' ')}</p>
                )}
              </div>
            </div>

            {/* Service Selection */}
            <div className="bg-white rounded-2xl p-4">
              <label className="text-sm font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Select Service *</label>
              <div className="space-y-2">
                {services.map(service => (
                  <button key={service.id} onClick={() => setSelectedService(service.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedService === service.id ? 'border-[#D97A5F] bg-[#FEF5F2]' : 'border-[#E5E5E5] hover:border-[#F4B5A4]'}`}>
                    <span className="font-medium text-[#1A1A1A]">{service.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#D97A5F] font-bold">${(service.price / 100).toFixed(0)}</span>
                      {selectedService === service.id && <Check className="w-5 h-5 text-[#D97A5F]" />}
                    </div>
                  </button>
                ))}
              </div>
              {services.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#6B6B6B] mb-4">No services yet</p>
                  <Link href="/provider/services" className="text-[#D97A5F] font-semibold hover:underline">Add a service first</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

