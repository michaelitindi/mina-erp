'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAiSettings() {
  const { orgId } = await auth()
  if (!orgId) {
    throw new Error('Unauthorized: No active organization context found.')
  }

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { geminiApiKey: true }
  })

  const hasEnvFallback = !!process.env.GEMINI_API_KEY
  const hasKey = !!org?.geminiApiKey

  let maskedKey = ''
  if (org?.geminiApiKey) {
    const key = org.geminiApiKey
    if (key.length > 8) {
      maskedKey = `••••••••${key.slice(-4)}`
    } else {
      maskedKey = '••••••••'
    }
  }

  return {
    hasKey,
    maskedKey,
    hasEnvFallback
  }
}

export async function updateAiSettings(apiKey: string) {
  const { orgId } = await auth()
  if (!orgId) {
    throw new Error('Unauthorized: No active organization context found.')
  }

  // Sanitization
  const trimmedKey = apiKey.trim()

  await prisma.organization.update({
    where: { clerkOrgId: orgId },
    data: {
      geminiApiKey: trimmedKey || null
    }
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/settings/ai')

  return { success: true }
}
