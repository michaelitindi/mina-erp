import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ __clerk_ticket?: string; __clerk_status?: string }>
}) {
  const { userId, orgId } = await auth()
  const params = await searchParams
  
  // If user is fully authenticated with an org, go to dashboard
  if (userId && orgId) {
    redirect('/dashboard')
  }
  
  // Check the clerk status from the invitation
  const status = params.__clerk_status
  
  if (status === 'sign_in') {
    // User exists but needs to sign in
    redirect(`/sign-in?redirect_url=/dashboard&__clerk_ticket=${params.__clerk_ticket}`)
  }
  
  if (status === 'sign_up') {
    // New user needs to sign up
    redirect(`/sign-up?redirect_url=/dashboard&__clerk_ticket=${params.__clerk_ticket}`)
  }
  
  // Default: redirect to sign-in
  redirect('/sign-in?redirect_url=/dashboard')
}
