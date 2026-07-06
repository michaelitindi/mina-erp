import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmation, sendNewOrderNotification } from '@/lib/email'

// Stripe Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    // In production, verify signature with Stripe SDK
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    const event = JSON.parse(body)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const sessionId = session.id
      const metadata = session.metadata || {}
      
      const { reconcilePaymentWebhook } = await import('@/app/actions/payments')
      const amount = session.amount_total ? session.amount_total / 100 : 0
      
      const reconciliationResult = await reconcilePaymentWebhook({
        amount,
        reference: sessionId,
        provider: 'Stripe',
        metadata
      })

      if (reconciliationResult.success) {
        // Send confirmation emails (optional but nice fallback if needed, we can keep the email send logic if we want to)
        return NextResponse.json({ message: reconciliationResult.message || 'Payment reconciled successfully' })
      } else {
        return NextResponse.json({ error: reconciliationResult.error || 'Reconciliation failed' }, { status: 400 })
      }
    }
    
    return NextResponse.json({ message: 'Event received' })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
