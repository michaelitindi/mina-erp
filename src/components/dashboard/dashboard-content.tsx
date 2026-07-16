'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  Settings,
  Receipt,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { askAiAssistant } from '@/app/actions/ai'
import { formatCurrency } from '@/lib/utils'

interface DashboardContentProps {
  stats: {
    invoiceCount: number
    customerCount: number
    pendingAmount: number
    paidAmount: number
  } | null
  currency: string
  userIsAdmin: boolean
}

interface Message {
  role: 'user' | 'model'
  parts: string
}

export function DashboardContent({ stats, currency, userIsAdmin }: DashboardContentProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'assistant'>('dashboard')
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
    if (activeView === 'assistant') {
      scrollToBottom()
    }
  }, [messages, activeView])

  // Load chat history from localStorage on client-side mount
  useEffect(() => {
    const cached = localStorage.getItem('mina_assistant_chat_history')
    if (cached) {
      try {
        setMessages(JSON.parse(cached))
      } catch (e) {
        console.error('Failed to parse cached chat history:', e)
      }
    }
  }, [])

  // Save chat history to localStorage when changed
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mina_assistant_chat_history', JSON.stringify(messages))
    }
  }, [messages])

  function handleClearHistory() {
    setMessages([])
    setErrorPayload(null)
    localStorage.removeItem('mina_assistant_chat_history')
  }

  async function handleSend(textToSend?: string) {
    const prompt = (textToSend || input).trim()
    if (!prompt) return

    setInput('')
    setErrorPayload(null)
    setIsLoading(true)
    
    if (activeView !== 'assistant') {
      setActiveView('assistant')
    }

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

  const cards = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.paidAmount, currency) : formatCurrency(0, currency),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Pending Invoices',
      value: stats ? formatCurrency(stats.pendingAmount, currency) : formatCurrency(0, currency),
      icon: Receipt,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Customers',
      value: stats?.customerCount.toString() || '0',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Invoice Count',
      value: stats?.invoiceCount.toString() || '0',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
    },
  ]

  if (activeView === 'assistant') {
    return (
      <div className="flex-1 flex flex-col min-h-[80vh] w-full bg-zinc-950 text-white border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Assistant Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer mr-1"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20">
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Mina Assistant
              </h3>
              <p className="text-[10px] text-zinc-500">Multimodal Agentic ERP Companion</p>
            </div>
          </div>
          <button 
            onClick={handleClearHistory}
            className="text-xs text-zinc-400 hover:text-white hover:underline transition-colors cursor-pointer"
          >
            Clear Conversation
          </button>
        </div>

        {/* Conversation history */}
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto min-h-[450px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
              <div className="rounded-2xl bg-blue-500/5 p-4 border border-blue-500/10">
                <Bot className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">Welcome to the ERP Workspace Assistant</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ask me anything about your active ERP tenant. I can search through Products, Customers, and Invoices, retrieve stock alerts, generate sales overviews, or directly insert records.
                </p>
                <p className="text-[10px] text-zinc-600 italic">
                  Note: Multi-step function execution calls may experience brief network latency as transactions are resolved.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`rounded-xl p-2 h-fit border shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                      : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-blue-600/15 border-blue-600/30 text-white rounded-tr-none'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 rounded-tl-none whitespace-pre-wrap font-sans'
                  }`}>
                    {msg.parts}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="rounded-xl p-2 bg-zinc-800/40 border border-zinc-700/30 text-zinc-400 h-fit shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl p-4 text-sm bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 rounded-tl-none flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-xs font-medium">Assistant executing tools and analyzing data...</span>
              </div>
            </div>
          )}

          {errorPayload && (
            <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
              isKeyMissing 
                ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300' 
                : 'border-red-500/20 bg-red-500/10 text-red-300'
            }`}>
              <div className="flex items-start gap-3 text-sm font-medium">
                <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${isKeyMissing ? 'text-yellow-400' : 'text-red-400'}`} />
                <div>
                  <p className="font-bold">{isKeyMissing ? 'Gemini API Key Required' : 'Assistant Encountered An Error'}</p>
                  <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{errorPayload.message}</p>
                </div>
              </div>
              {isKeyMissing && (
                <Link 
                  href="/dashboard/settings/ai"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-4 py-2 text-xs transition-colors cursor-pointer w-fit"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configure API Key
                </Link>
              )}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Grid */}
        {messages.length === 0 && (
          <div className="px-6 pb-6 pt-2">
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2.5">Suggested Prompts</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  disabled={isLoading}
                  className="text-left text-xs text-zinc-400 hover:text-white bg-zinc-950/40 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3.5 transition-all cursor-pointer group flex justify-between items-center gap-2"
                >
                  <span>{p.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="p-4 border-t border-zinc-800/80 bg-zinc-900/40"
        >
          <div className="relative flex items-center bg-zinc-950/60 rounded-xl border border-zinc-800 hover:border-zinc-700 focus-within:border-blue-500/80 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Mina Copilot to run actions or summarize reports..."
              disabled={isLoading}
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 pl-4 pr-14 py-3 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 p-2 transition-colors cursor-pointer shadow-md shadow-blue-600/15"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm">Welcome back to MinaERP</p>
        </div>
      </div>

      {/* Sleek, inviting centered AI Assistant bar */}
      <div 
        onClick={() => setActiveView('assistant')}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-300 group select-none"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-500/10 p-3 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shadow-inner shrink-0">
            <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              Ask Mina Assistant... 
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">CO-PILOT</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Query CRM metrics, list low-stock items, draft financial summaries, or create inventory items instantly using natural language.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer shadow-lg shadow-blue-600/15 shrink-0 self-start md:self-auto">
          Start Chat
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg bg-gradient-to-br ${card.color} p-3 shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/dashboard/finance/invoices"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group cursor-pointer"
          >
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">Create Invoice</span>
          </Link>
          <Link
            href="/dashboard/crm/customers"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group cursor-pointer"
          >
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">Add Customer</span>
          </Link>
          <Link
            href="/dashboard/finance/bills"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group cursor-pointer"
          >
            <div className="p-2 rounded-md bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">Enter Bill</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 group cursor-pointer"
          >
            <div className="p-2 rounded-md bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
