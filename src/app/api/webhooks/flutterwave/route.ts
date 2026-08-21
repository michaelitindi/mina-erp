import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getFlutterwaveSecretHash(): Promise<string | null> {
  // 1. Try global env var
  if (process.env.FLUTTERWAVE_SECRET_HASH) {
    return process.env.FLUTTERWAVE_SECRET_HASH
  }

  // 2. Look up from active Flutterwave provider config in the database
  const provider = await prisma.paymentProvider.findFirst({
    where: {
      providerType: 'FLUTTERWAVE',
      isActive: true,
    },
    select: { config: true },
  })

  if (provider) {
    const config = provider.config as Record<string, string> | null
    if (config?.secretHash) {
      return config.secretHash
    }
    if (config?.webhookSecret) {
      return config.webhookSecret
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('verif-hash')

    if (!signature) {
      return NextResponse.json({ error: 'Missing verif-hash header' }, { status: 400 })
    }

    const secretHash = await getFlutterwaveSecretHash()
    if (!secretHash) {
      console.error('Flutterwave secret hash not configured for webhook verification')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify secret hash matches
    if (signature !== secretHash) {
      console.error('Flutterwave webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = body.event
    const data = body.data

    if (event === 'charge.completed' && data.status === 'successful') {
      const txRef = data.tx_ref
      const metadata = data.meta || {}

      const { reconcilePaymentWebhook } = await import('@/app/actions/payments')
      const amount = data.amount || 0

      const reconciliationResult = await reconcilePaymentWebhook({
        amount,
        reference: txRef,
        provider: 'Flutterwave',
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
    console.error('Flutterwave webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
