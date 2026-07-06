import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmation, sendNewOrderNotification } from '@/lib/email'

// Flutterwave Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('verif-hash')
    
    // In production, verify signature
    // const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
    // if (signature !== secretHash) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    
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
