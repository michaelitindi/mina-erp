'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
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
  TrendingUp,
  Plus,
  MessageSquare,
  Trash2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  X,
  Printer
} from 'lucide-react'
import { askAiAssistant } from '@/app/actions/ai'
import { formatCurrency } from '@/lib/utils'
import { exportToCSV, printElementToPDF } from '@/lib/export'

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

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
}

function renderFormattedInline(text: string) {
  // Handles **bold**, `inline code`, and *italics*
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-zinc-900 border border-zinc-700/60 text-blue-400 px-1.5 py-0.5 rounded font-mono text-[11px]">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={idx} className="italic text-zinc-400">{part.slice(1, -1)}</em>
    }
    return part
  })
}

function MarkdownMessage({ content }: { content: string }) {
  if (!content) return null

  // Pre-process triple backtick code blocks
  const codeBlockRegex = /```([\s\S]*?)```/g
  const rawParts = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      rawParts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }
    rawParts.push({ type: 'code', content: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    rawParts.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-zinc-300">
      {rawParts.map((part, pIdx) => {
        if (part.type === 'code') {
          const lines = part.content.trim().split('\n')
          const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0].toLowerCase() : ''
          const codeText = lang ? lines.slice(1).join('\n') : part.content.trim()

          if (lang === 'chart' || lang === 'graph' || lang === 'bar') {
            const chartData: { label: string; value: number }[] = []
            let maxValue = 0
            codeText.split('\n').forEach(cLine => {
              const parts = cLine.split(':')
              if (parts.length >= 2) {
                const lbl = parts[0].trim()
                const val = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0
                chartData.push({ label: lbl, value: val })
                if (val > maxValue) maxValue = val
              }
            })

            if (chartData.length > 0) {
              const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500']
              return (
                <div key={pIdx} className="my-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Analytics Breakdown</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">Chart</span>
                  </div>
                  <div className="space-y-2.5">
                    {chartData.map((item, idx) => {
                      const percentage = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0
                      const barColor = colors[idx % colors.length]
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-300">{item.label}</span>
                            <span className="font-mono text-emerald-400 font-bold">{item.value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                            <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
          }

          return (
            <div key={pIdx} className="my-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs shadow-inner">
              {lang && <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-400/80">{lang}</div>}
              <pre className="overflow-x-auto text-zinc-200">
                <code>{codeText}</code>
              </pre>
            </div>
          )
        }

        // Parse text lines line-by-line / group-by-group
        const lines = part.content.split('\n')
        const elements: React.ReactNode[] = []
        let i = 0

        while (i < lines.length) {
          const line = lines[i]
          const trimmed = line.trim()

          if (!trimmed) {
            i++
            continue
          }

          // 1. Progress Bar Card detection
          const barMatch = trimmed.match(/^([-*]\s*)?(.*?)\s*\[([█▓▒░■#=.\s]+)\]\s*(.*)$/)
          if (barMatch) {
            const label = barMatch[2].trim()
            const blockStr = barMatch[3]
            const remainder = barMatch[4].trim()
            const filledCount = (blockStr.match(/[█▓■#=]/g) || []).length
            const totalCount = blockStr.length
            const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0

            elements.push(
              <div key={`bar-${i}`} className="my-2 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{renderFormattedInline(label)}</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">{remainder || `${percent}%`}</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
            i++
            continue
          }

          // 2. Headings
          if (trimmed.startsWith('# ')) {
            elements.push(<h1 key={i} className="mt-4 mb-2 text-lg font-bold text-white border-b border-zinc-800 pb-1">{renderFormattedInline(trimmed.slice(2))}</h1>)
            i++
            continue
          }
          if (trimmed.startsWith('## ')) {
            elements.push(<h2 key={i} className="mt-3 mb-1.5 text-base font-bold text-white">{renderFormattedInline(trimmed.slice(3))}</h2>)
            i++
            continue
          }
          if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={i} className="mt-2.5 mb-1 text-sm font-semibold text-blue-400">{renderFormattedInline(trimmed.slice(4))}</h3>)
            i++
            continue
          }

          // 3. Blockquotes
          if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote key={i} className="my-2 border-l-2 border-blue-500 bg-blue-500/5 px-3 py-2 text-xs italic text-blue-200/90 rounded-r-lg">
                {renderFormattedInline(trimmed.slice(2))}
              </blockquote>
            )
            i++
            continue
          }

          // 3. Table detection
          if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('-')) {
            const tableLines = []
            while (i < lines.length && lines[i].trim().includes('|')) {
              tableLines.push(lines[i].trim())
              i++
            }

            const parseRow = (rowStr: string) => {
              return rowStr
                .split('|')
                .map(c => c.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            }

            const headers = parseRow(tableLines[0])
            const rows = tableLines.slice(2).map(parseRow).filter(r => r.length > 0)

            elements.push(
              <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-zinc-800 shadow-lg">
                <table className="min-w-full divide-y divide-zinc-800 text-xs">
                  <thead className="bg-zinc-900/90">
                    <tr>
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2.5 text-left font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                          {renderFormattedInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 bg-zinc-950/50">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-900/40 transition-colors">
                        {row.map((cell, cIdx) => {
                          const isNum = /^\$?\d+([.,]\d+)*%?$/.test(cell.replace(/[\s,]/g, ''))
                          return (
                            <td key={cIdx} className={`px-3.5 py-2.5 text-zinc-300 ${isNum ? 'font-mono text-right font-medium text-emerald-400' : ''}`}>
                              {renderFormattedInline(cell)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
            continue
          }

          // 4. Unordered List detection
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const listItems = []
            while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
              listItems.push(lines[i].trim().replace(/^[\s-*]+\s*/, ''))
              i++
            }
            elements.push(
              <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-blue-400 text-zinc-300">
                {listItems.map((item, lIdx) => (
                  <li key={lIdx}>{renderFormattedInline(item)}</li>
                ))}
              </ul>
            )
            continue
          }

          // 5. Ordered List detection
          if (/^\d+\.\s+/.test(trimmed)) {
            const listItems = []
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
              listItems.push(lines[i].trim().replace(/^\s*\d+\.\s+/, ''))
              i++
            }
            elements.push(
              <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-4 list-decimal marker:text-blue-400 font-medium text-zinc-300">
                {listItems.map((item, lIdx) => (
                  <li key={lIdx}>{renderFormattedInline(item)}</li>
                ))}
              </ol>
            )
            continue
          }

          // 6. Regular Paragraph Line
          elements.push(
            <p key={i} className="my-1 leading-relaxed">
              {renderFormattedInline(trimmed)}
            </p>
          )
          i++
        }

        return <Fragment key={pIdx}>{elements}</Fragment>
      })}
    </div>
  )
}

export function DashboardContent({ stats, currency, userIsAdmin }: DashboardContentProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'assistant'>('dashboard')
  const [input, setInput] = useState('')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [hasLoadedSessions, setHasLoadedSessions] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorPayload, setErrorPayload] = useState<{ error: string; message: string } | null>(null)
  
  const [attachments, setAttachments] = useState<Array<{ name: string; mimeType: string; data: string; previewUrl: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find(s => s.id === activeSessionId)
  const messages = activeSession ? activeSession.messages : []

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
  }, [sessions, activeSessionId, activeView])

  // Load sessions from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('mina_assistant_sessions')
      let loadedSessions: ChatSession[] = []
      if (cached) {
        try {
          loadedSessions = JSON.parse(cached)
          setSessions(loadedSessions)
        } catch (e) {
          console.error('Failed to load chat sessions:', e)
        }
      }
      
      const cachedActiveId = localStorage.getItem('mina_assistant_active_session_id')
      if (cachedActiveId && loadedSessions.some(s => s.id === cachedActiveId)) {
        setActiveSessionId(cachedActiveId)
      } else if (loadedSessions.length > 0) {
        setActiveSessionId(loadedSessions[0].id)
      }
    }
    setHasLoadedSessions(true)
  }, [])

  // Save sessions to localStorage when changed
  useEffect(() => {
    if (hasLoadedSessions) {
      localStorage.setItem('mina_assistant_sessions', JSON.stringify(sessions))
      if (activeSessionId) {
        localStorage.setItem('mina_assistant_active_session_id', activeSessionId)
      } else {
        localStorage.removeItem('mina_assistant_active_session_id')
      }
    }
  }, [sessions, activeSessionId, hasLoadedSessions])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          const mimeType = file.type || 'application/octet-stream'
          const base64Data = result.split(',')[1]
          setAttachments(prev => [
            ...prev,
            {
              name: file.name,
              mimeType,
              data: base64Data,
              previewUrl: mimeType.startsWith('image/') ? result : ''
            }
          ])
        }
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleExportCSV() {
    if (!activeSession || activeSession.messages.length === 0) return
    const exportData = activeSession.messages.map((m, idx) => ({
      Index: idx + 1,
      Role: m.role.toUpperCase(),
      Content: m.parts
    }))
    exportToCSV(`Mina_AI_Chat_${activeSession.title}`, exportData)
  }

  function handleExportPDF() {
    printElementToPDF(`Mina ERP AI Chat Export - ${activeSession?.title || 'Report'}`)
  }

  function handleNewChat() {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setErrorPayload(null)
    setAttachments([])
  }

  function handleDeleteSession(id: string) {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id)
      } else {
        setActiveSessionId(null)
      }
    }
  }

  function handleClearHistory() {
    if (activeSessionId) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [] }
        }
        return s
      }))
    }
    setErrorPayload(null)
  }

  async function handleSend(textToSend?: string) {
    const prompt = (textToSend || input).trim()
    if (!prompt && attachments.length === 0) return

    const attachmentsToSend = attachments.map(a => ({ mimeType: a.mimeType, data: a.data }))
    const displayPrompt = attachments.length > 0
      ? `${prompt ? prompt + ' ' : ''}[Attached ${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]`
      : prompt

    setInput('')
    setAttachments([])
    setErrorPayload(null)
    setIsLoading(true)
    
    if (activeView !== 'assistant') {
      setActiveView('assistant')
    }

    let currentSessionId = activeSessionId
    let updatedSessions = [...sessions]
    
    // Create new session if none exists
    if (!currentSessionId || !sessions.some(s => s.id === currentSessionId)) {
      currentSessionId = crypto.randomUUID()
      const newSession: ChatSession = {
        id: currentSessionId,
        title: displayPrompt.substring(0, 32) || 'New Chat',
        messages: [{ role: 'user' as const, parts: displayPrompt }],
        createdAt: new Date().toISOString()
      }
      updatedSessions = [newSession, ...updatedSessions]
      setSessions(updatedSessions)
      setActiveSessionId(currentSessionId)
    } else {
      // Append message to active session
      updatedSessions = sessions.map(s => {
        if (s.id === currentSessionId) {
          const isFirstMessage = s.messages.length === 0
          return {
            ...s,
            title: isFirstMessage ? (displayPrompt.substring(0, 32) || s.title) : s.title,
            messages: [...s.messages, { role: 'user' as const, parts: displayPrompt }]
          }
        }
        return s
      })
      setSessions(updatedSessions)
    }

    const sessionMessages = updatedSessions.find(s => s.id === currentSessionId)?.messages || []
    // Get history before this prompt
    const historyForCall = sessionMessages.slice(0, -1)

    try {
      const result = await askAiAssistant(displayPrompt, historyForCall, attachmentsToSend)
      if (result.success) {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: result.history || []
            }
          }
          return s
        }))
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
      <div className="flex w-full h-[calc(100vh-9rem)] bg-zinc-950 text-white border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Side: Multi-Chat History Sidebar */}
        <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-[260px] border-r border-zinc-800 bg-zinc-900/30 shrink-0 h-full`}>
          <div className="p-3 border-b border-zinc-800">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-zinc-700 text-white font-bold p-3 text-xs transition-colors cursor-pointer group shadow-sm hover:shadow-inner"
            >
              <Plus className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
              New Chat
            </button>
          </div>
          
          {/* Scrollable List of Sessions */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider px-2 py-1.5 mb-1 select-none">Recent Conversations</p>
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-[10px] text-zinc-600 leading-normal">No past conversations found. Click "New Chat" to begin.</p>
              </div>
            ) : (
              sessions.map(s => (
                <div 
                  key={s.id}
                  onClick={() => {
                    setActiveSessionId(s.id)
                    setErrorPayload(null)
                  }}
                  className={`group flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                    s.id === activeSessionId
                      ? 'bg-blue-500/10 border-blue-500/20 text-white font-medium shadow-inner'
                      : 'bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${s.id === activeSessionId ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span className="truncate flex-1 text-left">{s.title || 'New Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSession(s.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity cursor-pointer shrink-0"
                    title="Delete Conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Stream */}
        <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
          {/* Assistant Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer mr-1"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20 shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm truncate max-w-[200px] md:max-w-xs">
                  {activeSession ? activeSession.title : 'Mina Assistant'}
                </h3>
                <p className="text-[10px] text-zinc-500">Multimodal Agentic ERP Companion</p>
              </div>
            </div>
            {activeSessionId && activeSession && activeSession.messages.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  title="Export Chat Data to CSV"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  title="Print or Export Chat to PDF"
                >
                  <Printer className="h-3.5 w-3.5 text-blue-400" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button 
                  onClick={handleClearHistory}
                  className="text-xs text-zinc-400 hover:text-white hover:underline transition-colors cursor-pointer ml-1"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Conversation history list */}
          <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-4">
                <div className="rounded-2xl bg-blue-500/5 p-4 border border-blue-500/10">
                  <Bot className="h-10 w-10 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white">Welcome to the ERP Workspace Assistant</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ask me anything about your active ERP tenant. You can attach receipts, PDFs, or photos, search through Products, Customers, and Invoices, retrieve stock alerts, generate sales overviews, or directly insert records.
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
                    <div className={`rounded-2xl p-4 text-sm leading-relaxed border break-words ${
                      msg.role === 'user'
                        ? 'bg-blue-600/15 border-blue-600/30 text-white rounded-tr-none'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 rounded-tl-none font-sans'
                    }`}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.parts}</div>
                      ) : (
                        <MarkdownMessage content={msg.parts} />
                      )}
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
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept="image/*,application/pdf" 
              className="hidden" 
            />

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
                    {att.previewUrl ? (
                      <img src={att.previewUrl} alt={att.name} className="h-4 w-4 rounded object-cover" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                    )}
                    <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative flex items-center bg-zinc-950/60 rounded-xl border border-zinc-800 hover:border-zinc-700 focus-within:border-blue-500/80 transition-colors">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="pl-3 pr-1 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Attach File or Image (Receipts, Invoices, Photos)"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachments.length > 0 ? "Add instructions for attached files..." : "Ask Mina Copilot or attach receipts/documents..."}
                disabled={isLoading}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 pl-2 pr-14 py-3 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className="absolute right-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 p-2 transition-colors cursor-pointer shadow-md shadow-blue-600/15"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
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
