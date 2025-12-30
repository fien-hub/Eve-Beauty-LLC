import { redirect } from 'next/navigation'

// This page redirects to discover page
// We use /customer/discover as the main discovery page for all users
export default async function BrowsePage() {
  redirect('/customer/discover')
}
