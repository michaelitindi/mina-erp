/**
 * Notification System
 * Supports email notifications via Resend and in-app notifications
 */

import { Resend } from 'resend'
import { prisma } from './prisma'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Notification types
export type NotificationType = 
  | 'invoice_created'
  | 'invoice_overdue'
  | 'invoice_paid'
  | 'payment_received'
  | 'order_created'
  | 'order_shipped'
  | 'low_stock'
  | 'leave_request'
  | 'leave_approved'
  | 'leave_rejected'
  | 'opportunity_won'
  | 'task_assigned'
  | 'system_alert'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  link?: string
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

// In-app notification helper
export async function createNotification(
  organizationId: string,
  userId: string | null,
  payload: NotificationPayload
): Promise<void> {
  try {
    // Store in database (requires Notification model)
    // For now, we'll log. Add Notification model to schema if needed.
    console.log(`[Notification] ${payload.type}: ${payload.title}`, {
      organizationId,
      userId,
      ...payload
    })

    // Could also integrate with:
    // - WebSocket for real-time updates
    // - Push notifications
    // - Slack/Discord webhooks
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// Email notification helper
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('[Email] Resend not configured, skipping email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    await resend.emails.send({
      from: options.from || process.env.FROM_EMAIL || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return { success: false, error: String(error) }
  }
}

// Pre-built notification templates
export const notificationTemplates = {
  invoiceCreated: (invoiceNumber: string, amount: number, customerName: string) => ({
    type: 'invoice_created' as NotificationType,
    title: 'New Invoice Created',
    message: `Invoice ${invoiceNumber} for $${amount.toLocaleString()} has been created for ${customerName}`,
    link: `/dashboard/finance/invoices`,
  }),

  invoiceOverdue: (invoiceNumber: string, amount: number, daysOverdue: number) => ({
    type: 'invoice_overdue' as NotificationType,
    title: 'Invoice Overdue',
    message: `Invoice ${invoiceNumber} ($${amount.toLocaleString()}) is ${daysOverdue} days overdue`,
    link: `/dashboard/finance/invoices`,
  }),

  paymentReceived: (amount: number, customerName: string) => ({
    type: 'payment_received' as NotificationType,
    title: 'Payment Received',
    message: `Received payment of $${amount.toLocaleString()} from ${customerName}`,
    link: `/dashboard/finance/payments`,
  }),

  lowStock: (productName: string, currentStock: number, reorderLevel: number) => ({
    type: 'low_stock' as NotificationType,
    title: 'Low Stock Alert',
    message: `${productName} is low on stock (${currentStock} remaining, reorder at ${reorderLevel})`,
    link: `/dashboard/inventory/products`,
  }),

  leaveRequest: (employeeName: string, startDate: string, endDate: string) => ({
    type: 'leave_request' as NotificationType,
    title: 'New Leave Request',
    message: `${employeeName} has requested leave from ${startDate} to ${endDate}`,
    link: `/dashboard/hr/leave`,
  }),

  leaveApproved: (startDate: string, endDate: string) => ({
    type: 'leave_approved' as NotificationType,
    title: 'Leave Approved',
    message: `Your leave request from ${startDate} to ${endDate} has been approved`,
    link: `/dashboard/hr/leave`,
  }),

  opportunityWon: (opportunityName: string, amount: number) => ({
    type: 'opportunity_won' as NotificationType,
    title: 'Deal Won! 🎉',
    message: `Congratulations! ${opportunityName} worth $${amount.toLocaleString()} has been won`,
    link: `/dashboard/crm/opportunities`,
  }),
}

// Email templates
export const emailTemplates = {
  invoiceReminder: (invoiceNumber: string, amount: number, dueDate: string, paymentLink?: string) => ({
    subject: `Payment Reminder: Invoice ${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Payment Reminder</h2>
        <p>This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> for <strong>$${amount.toLocaleString()}</strong> is due on <strong>${dueDate}</strong>.</p>
        ${paymentLink ? `<p><a href="${paymentLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Now</a></p>` : ''}
        <p style="color: #64748b; font-size: 14px;">If you've already paid, please disregard this reminder.</p>
      </div>
    `,
  }),

  orderConfirmation: (orderNumber: string, items: { name: string; quantity: number }[], total: number) => ({
    subject: `Order Confirmation: ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Order Confirmed</h2>
        <p>Thank you for your order! Here's a summary:</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: right;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px;">${item.name}</td>
                <td style="padding: 8px; text-align: right;">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><strong>Total:</strong> $${total.toLocaleString()}</p>
      </div>
    `,
  }),

  welcomeEmail: (name: string, companyName: string) => ({
    subject: `Welcome to ${companyName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome, ${name}!</h2>
        <p>Thank you for joining ${companyName}. We're excited to have you on board.</p>
        <p>If you have any questions, don't hesitate to reach out.</p>
        <p style="color: #64748b;">Best regards,<br>The ${companyName} Team</p>
      </div>
    `,
  }),
}
