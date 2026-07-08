import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from './prisma'

/**
 * Resolves the Gemini API Key for the given organization, falling back to process.env.GEMINI_API_KEY
 */
export async function getGeminiApiKey(clerkOrgId?: string | null): Promise<string | null> {
  if (clerkOrgId) {
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: clerkOrgId },
      select: { geminiApiKey: true },
    })
    if (org?.geminiApiKey) {
      return org.geminiApiKey
    }
  }
  return process.env.GEMINI_API_KEY || null
}

/**
 * Initializes and returns a GoogleGenerativeAI client instance for the current tenant or global fallback
 */
export async function getGeminiClient(clerkOrgId?: string | null) {
  const apiKey = await getGeminiApiKey(clerkOrgId)
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set it in Settings -> AI Configuration or set GEMINI_API_KEY in environment variables.')
  }
  return new GoogleGenerativeAI(apiKey)
}
