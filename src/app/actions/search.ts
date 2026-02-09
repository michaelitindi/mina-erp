'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { globalSearch, quickSearch, type SearchResult } from '@/lib/search'

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  if (!org) throw new Error('Organization not found')
  
  return { userId, orgId: org.id }
}

export async function search(
  query: string,
  types?: SearchResult['type'][],
  limit?: number
): Promise<SearchResult[]> {
  const { orgId } = await getOrganization()
  
  return globalSearch({
    query,
    organizationId: orgId,
    types,
    limit,
  })
}

export async function searchByType(
  type: SearchResult['type'],
  query: string,
  limit?: number
): Promise<SearchResult[]> {
  const { orgId } = await getOrganization()
  
  return quickSearch(type, query, orgId, limit)
}
