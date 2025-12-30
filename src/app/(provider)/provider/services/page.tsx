'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface ServiceCategory {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  category_id: string
  service_categories: ServiceCategory
}

interface ProviderService {
  id: string
  service_id: string
  base_price: number
  duration_minutes: number
  description: string | null
  is_active: boolean
  services: Service
}

export default function ProviderServicesPage() {
  const [services, setServices] = useState<ProviderService[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [providerId, setProviderId] = useState<string | null>(null)

  const [newService, setNewService] = useState({
    serviceId: '',
    price: '',
    duration: '60',
    description: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) return
    setProviderId(provider.id)

    const { data: providerServices } = await supabase
      .from('provider_services')
      .select('*, services(*, service_categories(id, name))')
      .eq('provider_id', provider.id)

    const { data: allServices } = await supabase
      .from('services')
      .select('*, service_categories(id, name)')

    setServices((providerServices as ProviderService[]) || [])
    setAvailableServices(allServices || [])
    setIsLoading(false)
  }

  async function handleAddService() {
    if (!providerId || !newService.serviceId) return

    const supabase = createClient()
    await supabase.from('provider_services').insert({
      provider_id: providerId,
      service_id: newService.serviceId,
      base_price: Math.round(parseFloat(newService.price) * 100),
      duration_minutes: parseInt(newService.duration),
      description: newService.description || null,
      is_active: true,
    })

    setShowAddModal(false)
    setNewService({ serviceId: '', price: '', duration: '60', description: '' })
    loadData()
  }

  async function toggleServiceActive(serviceId: string, isActive: boolean) {
    const supabase = createClient()
    await supabase
      .from('provider_services')
      .update({ is_active: !isActive })
      .eq('id', serviceId)
    loadData()
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#D97A5F]">Eve Beauty Pro</Link>
          <Link href="/provider/dashboard" className="text-[#6B6B6B] hover:text-[#D97A5F] font-medium transition-colors">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">My Services</h1>
          <Button onClick={() => setShowAddModal(true)}>+ Add Service</Button>
        </div>

        {services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A]">{service.services.name}</h3>
                    <p className="text-sm text-[#9E9E9E]">{service.duration_minutes} min • {service.services.service_categories?.name || 'Uncategorized'}</p>
                    {service.description && (
                      <p className="text-sm text-[#6B6B6B] mt-1">{service.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-[#D97A5F]">${(service.base_price / 100).toFixed(2)}</span>
                    <button
                      onClick={() => toggleServiceActive(service.id, service.is_active)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        service.is_active ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#F0F0F0] text-[#9E9E9E]'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-[#9E9E9E] mb-4">No services added yet</p>
            <Button onClick={() => setShowAddModal(true)}>Add Your First Service</Button>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Add Service</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Service</label>
                  <select
                    value={newService.serviceId}
                    onChange={(e) => setNewService(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#F4B5A4] transition-colors"
                  >
                    <option value="">Select a service</option>
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({(s as any).service_categories?.name || 'Uncategorized'})</option>
                    ))}
                  </select>
                </div>
                <Input label="Price ($)" type="number" value={newService.price} onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))} placeholder="50.00" />
                <Input label="Duration (minutes)" type="number" value={newService.duration} onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleAddService} className="flex-1">Add Service</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

