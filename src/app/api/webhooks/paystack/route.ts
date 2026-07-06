import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation, sendPaymentConfirmation, sendNewOrderNotification } from '@/lib/email'

// Paystack Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-paystack-signature')
    
    // In production, verify signature with crypto
    // const hash = crypto.createHmac('sha512', secretKey).update(JSON.stringify(body)).digest('hex')
    // if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    
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
