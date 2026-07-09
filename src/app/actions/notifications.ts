'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  if (!org) throw new Error('Organization not found')
  
  return { userId, orgId: org.id }
}

export async function getNotifications() {
  const { userId, orgId } = await getOrganization()

  let notifications = await prisma.notification.findMany({
    where: { 
      organizationId: orgId, 
      OR: [
        { userId: userId },
        { userId: null }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  // If no notifications exist, seed 3 onboarding/welcome alerts
  if (notifications.length === 0) {
    const welcomeAlerts = [
      {
        organizationId: orgId,
        userId: null,
        type: 'system_alert',
        title: 'Welcome to Mina ERP!',
        message: 'Your enterprise resource planning system is fully initialized. Explore the sales, inventory, finance, and settings modules.',
        link: '/dashboard',
        isRead: false
      },
      {
        organizationId: orgId,
        userId: userId,
        type: 'low_stock',
        title: 'Low Stock Alert Sample',
        message: 'This is a sample stock level alert. When products fall below their reorder threshold, in-app warnings are automatically triggered.',
        link: '/dashboard/inventory/products',
        isRead: false
      },
      {
        organizationId: orgId,
        userId: userId,
        type: 'low_stock',
        title: 'Etims Taxes Ready',
        message: 'KRA compliance tools are enabled for Kenyan organizations. Switch your country configuration in settings to manage eTIMS credentials.',
        link: '/dashboard/settings',
        isRead: false
      }
    ]

    await prisma.notification.createMany({
      data: welcomeAlerts
    })

    notifications = await prisma.notification.findMany({
      where: { 
        organizationId: orgId, 
        OR: [
          { userId: userId },
          { userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  }

  return notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString()
  }))
}

export async function markNotificationAsRead(id: string) {
  const { orgId } = await getOrganization()

  await prisma.notification.update({
    where: { id, organizationId: orgId },
    data: { isRead: true }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const { userId, orgId } = await getOrganization()

  await prisma.notification.updateMany({
    where: { 
      organizationId: orgId, 
      isRead: false,
      OR: [
        { userId: userId },
        { userId: null }
      ]
    },
    data: { isRead: true }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteNotification(id: string) {
  const { orgId } = await getOrganization()

  await prisma.notification.delete({
    where: { id, organizationId: orgId }
  })

  revalidatePath('/dashboard')
  return { success: true }
}
