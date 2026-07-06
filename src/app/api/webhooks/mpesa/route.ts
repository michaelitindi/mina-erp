import { NextResponse } from 'next/server'
import { reconcilePaymentWebhook } from '@/app/actions/payments'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const body = await req.json()
    console.log('M-Pesa webhook received:', JSON.stringify(body))

    // 1. Check if it is an STK Push Callback
    if (body.Body?.stkCallback) {
      const stkCallback = body.Body.stkCallback
      const checkoutRequestId = stkCallback.CheckoutRequestID
      const resultCode = stkCallback.ResultCode
      const resultDesc = stkCallback.ResultDesc

      if (resultCode !== 0) {
        console.log(`STK Push failed: ${resultDesc} (${resultCode})`)
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
      }

      const items = stkCallback.CallbackMetadata?.Item || []
      const amountItem = items.find((i: any) => i.Name === 'Amount')
      const receiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber')
      
      const amount = amountItem ? Number(amountItem.Value) : 0
      const reference = receiptItem ? String(receiptItem.Value) : checkoutRequestId

      const orderId = url.searchParams.get('orderId') || ''
      const type = url.searchParams.get('type') || 'ORDER'

      const metadata: Record<string, any> = { type }
      if (type === 'INVOICE') {
        metadata.invoiceId = orderId
      } else {
        metadata.orderId = orderId
      }

      const result = await reconcilePaymentWebhook({
        amount,
        reference,
        provider: 'M-Pesa STK Push',
        metadata
      })

      console.log('M-Pesa STK Push reconciliation result:', result)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    // 2. Check if it is a C2B Confirmation or Validation request
    if (body.TransID && body.BillRefNumber) {
      const isValidation = url.searchParams.get('validation') === 'true' || req.headers.get('x-safaricom-action') === 'validation'
      
      if (isValidation) {
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
      }

      const amount = Number(body.TransAmount)
      const reference = body.TransID
      const billRefNumber = body.BillRefNumber.trim()

      const metadata: Record<string, any> = {
        invoiceId: billRefNumber,
        orderId: billRefNumber,
        type: billRefNumber.includes('INV') ? 'INVOICE' : 'ORDER'
      }

      const result = await reconcilePaymentWebhook({
        amount,
        reference,
        provider: 'M-Pesa C2B',
        metadata
      })

      console.log('M-Pesa C2B reconciliation result:', result)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid request payload' }, { status: 400 })
  } catch (error: any) {
    console.error('M-Pesa webhook handler error:', error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
