import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'

async function getPaystackSecretKey(): Promise<string | null> {
  // 1. Try global env var
  if (process.env.PAYSTACK_SECRET_KEY) {
    return process.env.PAYSTACK_SECRET_KEY
  }

  // 2. Look up from active Paystack provider config in the database
  const provider = await prisma.paymentProvider.findFirst({
    where: {
      providerType: 'PAYSTACK',
      isActive: true,
    },
    select: { config: true },
  })

  if (provider) {
    const config = provider.config as Record<string, string> | null
    if (config?.secretKey) {
      return config.secretKey
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-paystack-signature header' }, { status: 400 })
    }

    const secretKey = await getPaystackSecretKey()
    if (!secretKey) {
      console.error('Paystack secret key not configured for webhook verification')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verify HMAC-SHA512 signature
    const hash = createHmac('sha512', secretKey).update(bodyText).digest('hex')
    if (hash !== signature) {
      console.error('Paystack webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(bodyText)
    const event = body.event
    const data = body.data

    if (event === 'charge.success') {
      const reference = data.reference
      const metadata = data.metadata || {}

      const { reconcilePaymentWebhook } = await import('@/app/actions/payments')
      const amount = data.amount ? data.amount / 100 : 0

      const reconciliationResult = await reconcilePaymentWebhook({
        amount,
        reference,
        provider: 'Paystack',
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
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
