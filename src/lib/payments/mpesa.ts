function formatMpesaPhoneNumber(phone: string): string {
  // Clean up special characters
  let cleaned = phone.replace(/[^0-9]/g, '')
  // If starts with +, strip it
  if (cleaned.startsWith('254')) {
    return cleaned
  }
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1)
  }
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned
  }
  return cleaned
}

export async function getMpesaAccessToken(
  consumerKey: string,
  consumerSecret: string,
  isSandbox = true
): Promise<string> {
  const baseUrl = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke'
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Failed to generate M-Pesa access token: ${errText}`)
  }

  const data = (await response.json()) as { access_token: string }
  return data.access_token
}

export async function initiateStkPush(params: {
  amount: number // in KES
  phoneNumber: string
  reference: string // e.g. INV-0001
  callbackUrl: string
  consumerKey: string
  consumerSecret: string
  shortcode: string
  passkey: string
  isSandbox?: boolean
}): Promise<{ success: boolean; checkoutRequestId?: string; error?: string }> {
  try {
    const isSandbox = params.isSandbox !== false // default to true
    const baseUrl = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke'
    
    const formattedPhone = formatMpesaPhoneNumber(params.phoneNumber)
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      return { success: false, error: 'Invalid phone number format. Must be a Kenyan mobile number.' }
    }

    const token = await getMpesaAccessToken(params.consumerKey, params.consumerSecret, isSandbox)
    
    // Generate timestamp YYYYMMDDHHmmss
    const date = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    
    // Generate Password: base64(shortcode + passkey + timestamp)
    const password = Buffer.from(`${params.shortcode}${params.passkey}${timestamp}`).toString('base64')

    const requestBody = {
      BusinessShortCode: params.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: formattedPhone,
      PartyB: params.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: params.callbackUrl,
      AccountReference: params.reference.substring(0, 12), // Safaricom limit is 12 chars
      TransactionDesc: `Pay ${params.reference}`,
    }

    const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = (await response.json()) as any
    if (response.ok && data.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
      }
    }

    return {
      success: false,
      error: data.errorMessage || data.ResponseDescription || 'STK Push request failed',
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'M-Pesa API error' }
  }
}

export async function registerMpesaC2BUrls(params: {
  validationUrl: string
  confirmationUrl: string
  shortcode: string
  consumerKey: string
  consumerSecret: string
  isSandbox?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const isSandbox = params.isSandbox !== false
    const baseUrl = isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke'
    const token = await getMpesaAccessToken(params.consumerKey, params.consumerSecret, isSandbox)

    const response = await fetch(`${baseUrl}/mpesa/c2b/v1/registerurl`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ShortCode: params.shortcode,
        ResponseType: 'Completed',
        ValidationURL: params.validationUrl,
        ConfirmationURL: params.confirmationUrl,
      }),
    })

    const data = (await response.json()) as any
    if (response.ok && (data.ResponseCode === '0' || data.ResponseDescription === 'success')) {
      return { success: true }
    }

    return { success: false, error: data.errorMessage || data.ResponseDescription || 'URL Registration failed' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
