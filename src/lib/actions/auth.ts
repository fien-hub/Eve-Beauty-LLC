'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'customer' | 'provider'

  // Split full name into first and last name
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile in database
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Create role-specific profile
    if (role === 'customer') {
      await supabase.from('customer_profiles').insert({ id: data.user.id })
    } else if (role === 'provider') {
      await supabase.from('provider_profiles').insert({ id: data.user.id })
    }
  }

  return { success: true, message: 'Check your email for verification link' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function resendVerification(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Verification email sent' }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password reset email sent' }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password updated successfully' }
}

