'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, Bot, User, ChevronDown, ChevronUp, Loader2, ArrowRight, AlertCircle, Settings } from 'lucide-react'
import { askAiAssistant } from '@/app/actions/ai'

interface Message {
  role: 'user' | 'model'
  parts: string
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorPayload, setErrorPayload] = useState<{ error: string; message: string } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    { label: 'Check Stock Alerts', text: 'Check for low stock alerts in inventory.' },
    { label: 'Sales Overview', text: 'Show me our financial sales overview and revenue status.' },
    { label: 'Create Test Product', text: 'Create product named Steel Beam with SKU SB-900, costing 45 and selling at 75' },
    { label: 'Find Customers', text: 'Search CRM for customer Acme' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  async function handleSend(textToSend?: string) {
    const prompt = (textToSend || input).trim()
    if (!prompt) return

    setInput('')
    setErrorPayload(null)
    setIsLoading(true)

    const updatedMessages = [...messages, { role: 'user' as const, parts: prompt }]
    setMessages(updatedMessages)

    try {
      const result = await askAiAssistant(prompt, messages)
      if (result.success) {
        setMessages(result.history || [])
      } else {
        setErrorPayload({
          error: result.error || 'ERROR',
          message: result.message || 'Operation failed.'
        })
      }
    } catch (err: any) {
      setErrorPayload({
        error: 'SYSTEM_ERROR',
        message: err.message || 'Failed to communicate with Server Action.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isKeyMissing = errorPayload?.error === 'API_KEY_MISSING'

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-900/60 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20 shadow-inner">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              Mina Assistant <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">CO-PILOT</span>
            </h3>
            <p className="text-xs text-zinc-400">Your executive business intelligence companion</p>
          </div>
        </div>
        <div className="text-zinc-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {/* Collapsed State Quick Preview Bar */}
      {!isOpen && (
        <div className="px-4 py-3 bg-zinc-950/20 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
          <span>Click to open chatbot conversation history</span>
          <span className="text-blue-400 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}>
            Quick prompt AI →
          </span>
        </div>
      )}

      {/* Expanded Content Area */}
      {isOpen && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/10">
          {/* Scrollable messages */}
          <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-6 px-4 text-zinc-500 space-y-3">
                <Bot className="h-9 w-9 mx-auto text-zinc-700" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-300">How can I assist your business today?</p>
                  <p className="text-xs text-zinc-500">I can read sales reports, analyze inventory, add products, or register customers.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`rounded-xl p-1.5 h-fit border ${
                    msg.role === 'user' 
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                      : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400'
                  }`}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`rounded-2xl p-3 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-blue-600/15 border-blue-600/30 text-white rounded-tr-none'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.parts}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="rounded-xl p-1.5 bg-zinc-800/40 border border-zinc-700/30 text-zinc-400 h-fit">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl p-3 text-sm bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span>Processing request...</span>
                </div>
              </div>
            )}

            {/* Structured API Key Error Banner */}
            {errorPayload && (
              <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
                isKeyMissing 
                  ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300' 
                  : 'border-red-500/20 bg-red-500/10 text-red-300'
              }`}>
                <div className="flex items-start gap-2.5 text-sm font-medium">
                  {isKeyMissing ? <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-bold">{isKeyMissing ? 'API Key Required' : 'Request Failed'}</p>
                    <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{errorPayload.message}</p>
                  </div>
                </div>
                {isKeyMissing && (
                  <Link 
                    href="/dashboard/settings/ai"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 text-zinc-950 font-bold px-4 py-2 text-xs transition-colors hover:bg-yellow-400 w-fit"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configure API Key
                  </Link>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-850 hover:bg-zinc-800 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-full px-3 py-1.5 transition-all disabled:opacity-50"
              >
                <span>{p.label}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex items-center gap-2 p-3 border-t border-zinc-800/80 bg-zinc-900/40"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask assistant to do something (e.g. check alerts or create a product)..."
              disabled={isLoading}
              className="flex-1 bg-zinc-950/60 text-sm text-white placeholder-zinc-500 border border-zinc-800 hover:border-zinc-700 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 p-2.5 transition-colors shadow-lg shadow-blue-600/15"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
