'use client'

import { useState } from 'react'
import { createWebBooking } from '@/app/actions/website-builder'
import { Calendar, CheckCircle2, Loader2, Clock } from 'lucide-react'

export function WebBookingClient({
  websiteId,
  title,
  subtitle,
  primaryColor
}: {
  websiteId: string
  title?: string
  subtitle?: string
  primaryColor: string
}) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 10:00 AM')
  const [serviceName, setServiceName] = useState('Business Consultation')
  const [notes, setNotes] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      if (!bookingDate) {
        throw new Error('Please select a booking date')
      }
      await createWebBooking(websiteId, {
        clientName,
        clientEmail,
        bookingDate,
        timeSlot,
        serviceName,
        notes
      })
      setIsSuccess(true)
      setClientName('')
      setClientEmail('')
      setBookingDate('')
      setNotes('')
    } catch (err: any) {
      setError(err?.message || 'Failed to request booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8 bg-zinc-900/30 border border-zinc-900 rounded-2xl max-w-md mx-auto p-6">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Booking Requested</h3>
        <p className="text-xs text-zinc-400">
          Your service consultation request has been logged successfully. Our team will review the availability slot and contact you shortly.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-xs font-semibold text-zinc-500 hover:text-white cursor-pointer mt-4"
        >
          Book another slot
        </button>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-900 p-6 md:p-8 rounded-2xl max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          {title || 'Schedule Consultation'}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">{subtitle || 'Select your track and request an appointment.'}</p>
      </div>

      {error && (
        <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Your Name *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
              placeholder="e.g. john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Service Type *</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-zinc-955 border border-zinc-800 px-2.5 py-2 text-xs text-white rounded focus:outline-none cursor-pointer"
            >
              <option value="Business Consultation">Business Consultation</option>
              <option value="Compliance Setup Audit">Compliance Setup Audit</option>
              <option value="Custom Technical Advisory">Custom Technical Advisory</option>
              <option value="Financial Strategy Session">Financial Strategy Session</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Time Slot *</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full bg-zinc-955 border border-zinc-800 px-2.5 py-2 text-xs text-white rounded focus:outline-none cursor-pointer"
            >
              <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
              <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
              <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
              <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Preferred Date *</label>
          <input
            type="date"
            required
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Special Requirements / Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
            placeholder="Describe your request..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Requesting Slot...
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              Confirm Reservation Request
            </>
          )}
        </button>
      </form>
    </div>
  )
}
