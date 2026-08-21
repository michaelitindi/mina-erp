import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getStripeWebhookSecret(): Promise<{ secret: string; orgId?: string } | null> {
  // 1. Try global env var (single-org or shared webhook secret)
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    return { secret: process.env.STRIPE_WEBHOOK_SECRET }
  }

  // 2. Look up from active Stripe provider configs in the database
  const provider = await prisma.paymentProvider.findFirst({
    where: {
      providerType: 'STRIPE',
      isActive: true,
    },
    select: { config: true, organizationId: true },
  })

  if (provider) {
    const config = provider.config as Record<string, string> | null
    if (config?.webhookSecret) {
      return { secret: config.webhookSecret, orgId: provider.organizationId }
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const secretResult = await getStripeWebhookSecret()
    if (!secretResult) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify the event using the Stripe SDK
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-12-15.clover',
    })

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, secretResult.secret)
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

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
