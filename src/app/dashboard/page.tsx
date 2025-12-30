import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is a provider
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Redirect based on role - providers go to provider home, customers go to discover feed
  if (providerProfile) {
    redirect('/provider/home')
  } else {
    redirect('/customer/discover')
  }
}

