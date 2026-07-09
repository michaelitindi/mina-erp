'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Trash2, Shield, AlertTriangle, Info, Clock } from 'lucide-react'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification
} from '@/app/actions/notifications'

interface Notification {
  id: string
  organizationId: string
  userId: string | null
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const loadNotifications = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load notifications on mount and when dropdown is toggled
  useEffect(() => {
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await markNotificationAsRead(n.id)
        setNotifications(notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item))
      } catch (err) {
        console.error(err)
      }
    }
    setIsOpen(false)
    if (n.link) {
      router.push(n.link)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'system_alert':
        return <Shield className="h-4 w-4 text-blue-400" />
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      default:
        return <Info className="h-4 w-4 text-zinc-400" />
    }
  }

  // Helper for nice relative time strings
  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell Trigger Button */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            loadNotifications() // Reload latest on open
          }
        }}
        className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-zinc-950 px-1 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl backdrop-blur-md z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs uppercase tracking-wider">Alerts</span>
              {unreadCount > 0 && (
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-850">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                <Bell className="h-8 w-8 mx-auto text-zinc-700 mb-2" />
                No alerts at this moment
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-blue-500/[0.02]' : ''}`}
                >
                  {/* Indicator Dot */}
                  {!n.isRead && (
                    <span className="absolute left-2.5 top-4 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                  {/* Icon */}
                  <div className={`mt-0.5 h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-850 shrink-0 bg-zinc-900/80`}>
                    {getIcon(n.type)}
                  </div>
                  {/* Message body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-xs text-white leading-snug truncate ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-2 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(n.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={(e) => handleDelete(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-3 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
