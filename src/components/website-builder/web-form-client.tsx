'use client'

import { useState } from 'react'
import { submitWebForm } from '@/app/actions/website-builder'
import { Send, CheckCircle, Loader2 } from 'lucide-react'

export function WebFormClient({
  websiteId,
  formType,
  title,
  subtitle,
  buttonText,
  primaryColor
}: {
  websiteId: string
  formType: string
  title?: string
  subtitle?: string
  buttonText?: string
  primaryColor: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [admissionLevel, setAdmissionLevel] = useState('Grade 1')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const payload = JSON.stringify({
        name,
        email,
        phone,
        message,
        ...(formType === 'ADMISSION' ? { admissionLevel } : {})
      })
      await submitWebForm(websiteId, formType, payload)
      setIsSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
      setPhone('')
    } catch (err) {
      setError('Failed to submit form. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-3 py-6 animate-fade-in">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Submission Successful</h3>
        <p className="text-xs text-zinc-400">Thank you! Your inquiry was successfully recorded.</p>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-xs font-semibold text-zinc-500 hover:text-white cursor-pointer mt-4"
        >
          Submit another message
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-white">{title || 'Send Message'}</h2>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
            placeholder="e.g. john@example.com"
          />
        </div>

        {formType === 'ADMISSION' && (
          <>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
                placeholder="e.g. +254 700 000 000"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Admission Grade/Level *</label>
              <select
                value={admissionLevel}
                onChange={(e) => setAdmissionLevel(e.target.value)}
                className="w-full bg-zinc-955 border border-zinc-800 px-2 py-1.5 text-xs text-white rounded"
              >
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Message / Detail *</label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white rounded focus:border-blue-500 focus:outline-none placeholder-zinc-700"
            placeholder="Enter details..."
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
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {buttonText || 'Send'}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
