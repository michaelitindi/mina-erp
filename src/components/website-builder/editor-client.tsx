'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateWebsite,
  createWebPage,
  deleteWebPage,
  addWebSection,
  updateWebSection,
  deleteWebSection,
  updateSectionOrder,
  createWebCourse,
  createWebLesson
} from '@/app/actions/website-builder'
import {
  Globe,
  FileText,
  Settings,
  Palette,
  GraduationCap,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Save,
  Check,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ListCollapse,
  Video,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export function EditorClient({ website: initialWebsite }: { website: any }) {
  const [website, setWebsite] = useState(initialWebsite)
  const [activeTab, setActiveTab] = useState<'PAGES' | 'STYLING' | 'SETTINGS' | 'COURSES'>('PAGES')
  const [activePageId, setActivePageId] = useState(initialWebsite.pages[0]?.id || '')
  
  // Selection for page creation
  const [showAddPage, setShowAddPage] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')

  // Section inspector selection
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [inspectorContent, setInspectorContent] = useState<any>(null)

  // Gated Elearning states
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseSlug, setNewCourseSlug] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')
  const [newCoursePrice, setNewCoursePrice] = useState(0)

  const [showAddLesson, setShowAddLesson] = useState<string | null>(null)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonSlug, setNewLessonSlug] = useState('')
  const [newLessonContent, setNewLessonContent] = useState('')
  const [newLessonVideo, setNewLessonVideo] = useState('')
  const [newLessonFree, setNewLessonFree] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const activePage = website.pages.find((p: any) => p.id === activePageId) || website.pages[0]

  // Global settings changes
  const handleSettingsChange = (field: string, value: any) => {
    setWebsite((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  // Save global website settings
  const handleSaveSettings = async () => {
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const updated = await updateWebsite(website.id, website)
      setWebsite((prev: any) => ({
        ...prev,
        ...updated
      }))
      setSuccessMsg('Website configuration saved successfully!')
      router.refresh()
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  // Create new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle || !newPageSlug) return
    setErrorMsg('')
    try {
      const page = await createWebPage(website.id, newPageTitle, newPageSlug)
      setWebsite((prev: any) => ({
        ...prev,
        pages: [...prev.pages, { ...page, sections: page.sections || [] }]
      }))
      setActivePageId(page.id)
      setShowAddPage(false)
      setNewPageTitle('')
      setNewPageSlug('')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create page.')
    }
  }

  // Delete page
  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page? All sections will be lost.')) {
      try {
        await deleteWebPage(pageId)
        setWebsite((prev: any) => ({
          ...prev,
          pages: prev.pages.filter((p: any) => p.id !== pageId)
        }))
        if (activePageId === pageId) {
          setActivePageId(website.pages[0]?.id || '')
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to delete page.')
      }
    }
  }

  // Add section
  const handleAddSection = async (type: string) => {
    let content = {}
    if (type === 'HERO') {
      content = { title: 'New Hero Header', subtitle: 'Add a description here.', ctaText: 'Get Started', ctaUrl: '/contact' }
    } else if (type === 'FEATURES') {
      content = { title: 'Our Core Value Pillars', subtitle: 'Pillars of excellence.', items: [{ title: 'Pillar One', desc: 'Detail description.' }] }
    } else if (type === 'PRICING') {
      content = { title: 'Simple Gated Pricing', items: [{ name: 'Starter', price: '$19', features: ['Core course access'] }] }
    } else if (type === 'TESTIMONIALS') {
      content = { title: 'Student Success Stories', items: [{ quote: 'This was an amazing learning experience.', author: 'Alex Smith' }] }
    } else if (type === 'CONTACT_FORM') {
      content = { title: 'Write to us', subtitle: 'Use this form for direct messages.', buttonText: 'Send', formType: 'CONTACT' }
    } else {
      content = { title: 'Information Section', body: 'Standard text block content goes here.' }
    }

    try {
      const section = await addWebSection(activePage.id, type, JSON.stringify(content))
      setWebsite((prev: any) => ({
        ...prev,
        pages: prev.pages.map((p: any) => {
          if (p.id === activePage.id) {
            return { ...p, sections: [...p.sections, section] }
          }
          return p
        })
      }))
    } catch (e: any) {
      setErrorMsg('Failed to add section')
    }
  }

  // Open section inspector
  const openInspector = (section: any) => {
    setEditingSectionId(section.id)
    try {
      setInspectorContent(JSON.parse(section.content))
    } catch (e) {
      setInspectorContent({})
    }
  }

  // Update section content
  const handleSaveSectionContent = async () => {
    if (!editingSectionId) return
    setIsSaving(true)
    try {
      const updated = await updateWebSection(editingSectionId, JSON.stringify(inspectorContent))
      setWebsite((prev: any) => ({
        ...prev,
        pages: prev.pages.map((p: any) => {
          if (p.id === activePage.id) {
            return {
              ...p,
              sections: p.sections.map((s: any) => (s.id === editingSectionId ? updated : s))
            }
          }
          return p
        })
      }))
      setEditingSectionId(null)
      setSuccessMsg('Section content saved.')
    } catch (e) {
      setErrorMsg('Failed to save section.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (confirm('Delete this section?')) {
      try {
        await deleteWebSection(sectionId)
        setWebsite((prev: any) => ({
          ...prev,
          pages: prev.pages.map((p: any) => {
            if (p.id === activePage.id) {
              return { ...p, sections: p.sections.filter((s: any) => s.id !== sectionId) }
            }
            return p
          })
        }))
        if (editingSectionId === sectionId) setEditingSectionId(null)
      } catch (e) {
        setErrorMsg('Failed to delete section.')
      }
    }
  }

  // Move section (up/down)
  const handleMoveSection = async (index: number, direction: 'UP' | 'DOWN') => {
    const pageSections = [...activePage.sections]
    const targetIndex = direction === 'UP' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= pageSections.length) return

    // Swap
    const temp = pageSections[index]
    pageSections[index] = pageSections[targetIndex]
    pageSections[targetIndex] = temp

    // optimistic UI update
    setWebsite((prev: any) => ({
      ...prev,
      pages: prev.pages.map((p: any) => {
        if (p.id === activePage.id) {
          return { ...p, sections: pageSections }
        }
        return p
      })
    }))

    try {
      await updateSectionOrder(pageSections.map((s: any) => s.id))
    } catch (e) {
      setErrorMsg('Failed to save section order.')
    }
  }

  // Create course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseTitle || !newCourseSlug) return
    setErrorMsg('')
    try {
      const course = await createWebCourse(website.id, {
        title: newCourseTitle,
        slug: newCourseSlug,
        description: newCourseDesc,
        price: newCoursePrice
      })
      setWebsite((prev: any) => ({
        ...prev,
        courses: [...(prev.courses || []), { ...course, lessons: [] }]
      }))
      setShowAddCourse(false)
      setNewCourseTitle('')
      setNewCourseSlug('')
      setNewCourseDesc('')
      setNewCoursePrice(0)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create course.')
    }
  }

  // Create lesson
  const handleCreateLesson = async (courseId: string) => {
    if (!newLessonTitle || !newLessonSlug) return
    setErrorMsg('')
    try {
      const lesson = await createWebLesson(courseId, {
        title: newLessonTitle,
        slug: newLessonSlug,
        content: newLessonContent,
        videoUrl: newLessonVideo,
        isFree: newLessonFree
      })
      setWebsite((prev: any) => ({
        ...prev,
        courses: prev.courses.map((c: any) => {
          if (c.id === courseId) {
            return { ...c, lessons: [...c.lessons, lesson] }
          }
          return c
        })
      }))
      setShowAddLesson(null)
      setNewLessonTitle('')
      setNewLessonSlug('')
      setNewLessonContent('')
      setNewLessonVideo('')
      setNewLessonFree(true)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create lesson.')
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-zinc-950 text-white overflow-hidden">
      {/* 1. LEFT SIDEBAR: Navigations and tab controls */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-full select-none">
        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <button
            onClick={() => { setActiveTab('PAGES'); setEditingSectionId(null) }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'PAGES' ? 'border-blue-500 text-blue-400 bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            Pages
          </button>
          <button
            onClick={() => { setActiveTab('STYLING'); setEditingSectionId(null) }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'STYLING' ? 'border-blue-500 text-blue-400 bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Palette className="h-4 w-4" />
            Style
          </button>
          <button
            onClick={() => { setActiveTab('SETTINGS'); setEditingSectionId(null) }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all border-b-2 ${
              activeTab === 'SETTINGS' ? 'border-blue-500 text-blue-400 bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            Setup
          </button>
          {website.type === 'COURSE' && (
            <button
              onClick={() => { setActiveTab('COURSES'); setEditingSectionId(null) }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 cursor-pointer transition-all border-b-2 ${
                activeTab === 'COURSES' ? 'border-blue-500 text-blue-400 bg-zinc-800/30' : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              LMS
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PAGES EDITOR */}
          {activeTab === 'PAGES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-300">Pages List</h3>
                <button
                  onClick={() => setShowAddPage(true)}
                  className="rounded bg-blue-600 hover:bg-blue-700 p-1 text-white cursor-pointer"
                  title="Add Page"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {showAddPage && (
                <form onSubmit={handleCreatePage} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Page Title"
                    value={newPageTitle}
                    onChange={(e) => {
                      setNewPageTitle(e.target.value)
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Page Slug (url)"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAddPage(false)} className="flex-1 text-[10px] bg-zinc-900 border border-zinc-800 py-1 rounded text-zinc-400 cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-700 py-1 rounded text-white cursor-pointer">Create</button>
                  </div>
                </form>
              )}

              <div className="space-y-1">
                {website.pages.map((p: any) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                      p.id === activePageId ? 'bg-zinc-850 border border-zinc-700 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                    onClick={() => { setActivePageId(p.id); setEditingSectionId(null) }}
                  >
                    <span className="truncate">{p.title}</span>
                    {p.slug !== 'home' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id) }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 rounded p-0.5 cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* SECTIONS LIST OF ACTIVE PAGE */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-300">Page Sections</h3>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{activePage?.sections?.length || 0}</span>
                </div>

                <div className="space-y-2">
                  {activePage?.sections?.map((sec: any, idx: number) => (
                    <div
                      key={sec.id}
                      className={`rounded-lg border bg-zinc-950 p-2.5 flex items-center justify-between transition-all group ${
                        editingSectionId === sec.id ? 'border-blue-500 shadow-md shadow-blue-900/10' : 'border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="cursor-pointer flex-1 min-w-0 pr-2" onClick={() => openInspector(sec)}>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{sec.type}</p>
                        <p className="text-[10px] text-zinc-500 truncate">Click to inspect / edit details</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSection(idx, 'UP')}
                          disabled={idx === 0}
                          className="text-zinc-500 hover:text-white p-0.5 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 'DOWN')}
                          disabled={idx === activePage.sections.length - 1}
                          className="text-zinc-500 hover:text-white p-0.5 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="text-zinc-600 hover:text-red-400 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-zinc-800 pt-3">
                  <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Add Page Section</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['HERO', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CONTACT_FORM', 'RICH_TEXT'].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleAddSection(t)}
                        className="py-1.5 px-2 bg-zinc-800/40 hover:bg-zinc-800 hover:text-white text-zinc-400 rounded text-[10px] text-left border border-zinc-800/80 cursor-pointer transition-all"
                      >
                        + {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STYLING PANEL */}
          {activeTab === 'STYLING' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2">Global Styling</h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={website.primaryColor}
                    onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                    className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={website.primaryColor}
                    onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={website.secondaryColor}
                    onChange={(e) => handleSettingsChange('secondaryColor', e.target.value)}
                    className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={website.secondaryColor}
                    onChange={(e) => handleSettingsChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Font Family</label>
                <select
                  value={website.fontFamily}
                  onChange={(e) => handleSettingsChange('fontFamily', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="sans">Geist Sans (Clean Modern)</option>
                  <option value="inter">Inter (UI Professional)</option>
                  <option value="outfit">Outfit (Creative Branding)</option>
                  <option value="serif">Lora Serif (Academic Classic)</option>
                  <option value="mono">Geist Mono (Technical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Custom CSS Overrides</label>
                <textarea
                  rows={6}
                  value={website.customCss || ''}
                  onChange={(e) => handleSettingsChange('customCss', e.target.value)}
                  placeholder="/* Write custom CSS overrides here */"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Apply Global Style
              </button>
            </div>
          )}

          {/* TAB 3: SETTINGS PANEL */}
          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2">Website Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Website Name</label>
                <input
                  type="text"
                  value={website.name}
                  onChange={(e) => handleSettingsChange('name', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={website.description || ''}
                  onChange={(e) => handleSettingsChange('description', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Payment Provider</label>
                <select
                  value={website.paymentProvider}
                  onChange={(e) => handleSettingsChange('paymentProvider', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="COD">Cash on Delivery / Gated Free</option>
                  <option value="STRIPE">Stripe Checkout</option>
                  <option value="LEMONSQUEEZY">LemonSqueezy</option>
                  <option value="PAYSTACK">Paystack</option>
                </select>
              </div>

              {website.paymentProvider === 'STRIPE' && (
                <div className="space-y-2 bg-zinc-950 p-2.5 rounded border border-zinc-850">
                  <div>
                    <label className="block text-[10px] text-zinc-500">Stripe Public Key</label>
                    <input
                      type="text"
                      value={website.stripePublicKey || ''}
                      onChange={(e) => handleSettingsChange('stripePublicKey', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500">Stripe Secret Key</label>
                    <input
                      type="password"
                      value={website.stripeSecretKey || ''}
                      onChange={(e) => handleSettingsChange('stripeSecretKey', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Save Website Settings
              </button>
            </div>
          )}

          {/* TAB 4: COURSES/LMS PANEL (ONLY IF COURSE PORTAL) */}
          {activeTab === 'COURSES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-300">Course Catalog</h3>
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="rounded bg-blue-600 hover:bg-blue-700 p-1 text-white cursor-pointer"
                  title="Create Course"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {showAddCourse && (
                <form onSubmit={handleCreateCourse} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Course Title"
                    value={newCourseTitle}
                    onChange={(e) => {
                      setNewCourseTitle(e.target.value)
                      setNewCourseSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="URL slug"
                    value={newCourseSlug}
                    onChange={(e) => setNewCourseSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <textarea
                    placeholder="Short course description"
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price (USD)"
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAddCourse(false)} className="flex-1 text-[10px] bg-zinc-900 border border-zinc-800 py-1 rounded text-zinc-400 cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-700 py-1 rounded text-white cursor-pointer">Create</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {website.courses?.map((c: any) => (
                  <div key={c.id} className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white">{c.title}</h4>
                        <p className="text-[10px] text-zinc-500">${c.price}</p>
                      </div>
                      <button
                        onClick={() => setShowAddLesson(showAddLesson === c.id ? null : c.id)}
                        className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        + Lesson
                      </button>
                    </div>

                    {showAddLesson === c.id && (
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Lesson Title"
                          value={newLessonTitle}
                          onChange={(e) => {
                            setNewLessonTitle(e.target.value)
                            setNewLessonSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Lesson URL Slug"
                          value={newLessonSlug}
                          onChange={(e) => setNewLessonSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                        <textarea
                          placeholder="Lesson Content (Markdown/HTML)"
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Video Embed URL (Optional)"
                          value={newLessonVideo}
                          onChange={(e) => setNewLessonVideo(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newLessonFree}
                            onChange={(e) => setNewLessonFree(e.target.checked)}
                            id="isFree"
                          />
                          <label htmlFor="isFree" className="text-[10px] text-zinc-400">Free Preview Lesson</label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCreateLesson(c.id)}
                          className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px]"
                        >
                          Add Lesson
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 pl-2 border-l border-zinc-800">
                      {c.lessons?.map((les: any) => (
                        <div key={les.id} className="text-[10px] text-zinc-400 flex items-center justify-between py-0.5">
                          <span className="truncate flex items-center gap-1">
                            {les.videoUrl ? <Video className="h-3 w-3 text-purple-400" /> : <FileText className="h-3 w-3 text-zinc-500" />}
                            {les.title}
                          </span>
                          <span className="text-[8px] bg-zinc-800 px-1 rounded text-zinc-500">{les.isFree ? 'Free' : 'Gated'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL: Interactive Canvas Previews */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
        <div className="border-b border-zinc-800 bg-zinc-900/50 p-3 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Editing:</span>
            <span className="text-xs font-bold text-white">{activePage?.title}</span>
            <span className="text-[10px] text-zinc-600 font-mono">/site/{website.slug}/{activePage?.slug === 'home' ? '' : activePage?.slug}</span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/site/${website.slug}/${activePage?.slug === 'home' ? '' : activePage?.slug}`}
              target="_blank"
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-3 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Live dynamic preview rendering cards representing sections */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col items-center">
          {errorMsg && (
            <div className="w-full max-w-4xl p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm mb-4">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="w-full max-w-4xl p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm mb-4">
              {successMsg}
            </div>
          )}

          {activePage?.sections?.length === 0 ? (
            <div className="m-auto text-center border-2 border-dashed border-zinc-800 rounded-xl p-12 max-w-md bg-zinc-900/20">
              <FileText className="h-10 w-10 text-zinc-700 mx-auto" />
              <p className="text-sm font-bold text-white mt-4">Empty Page Canvas</p>
              <p className="text-xs text-zinc-500 mt-1">Use the left page panel to add section layout components.</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl space-y-8 pb-12">
              {activePage?.sections?.map((sec: any) => {
                let parsedContent = {}
                try {
                  parsedContent = JSON.parse(sec.content)
                } catch (e) {
                  parsedContent = {}
                }
                const content: any = parsedContent

                return (
                  <div
                    key={sec.id}
                    className={`relative group rounded-xl border transition-all overflow-hidden bg-zinc-900/30 ${
                      editingSectionId === sec.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Section Header Controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1 z-15 select-none">
                      <button
                        onClick={() => openInspector(sec)}
                        className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-blue-400 cursor-pointer"
                        title="Edit Section Details"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="absolute top-2 left-2 z-15 bg-zinc-950/80 border border-zinc-800/80 px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider font-semibold text-zinc-400">
                      {sec.type}
                    </div>

                    {/* DYNAMIC COMPONENT CANVAS RENDERERS */}
                    {sec.type === 'HERO' && (
                      <div className="relative py-16 px-8 text-center bg-zinc-900/60 overflow-hidden flex flex-col items-center">
                        {content.bgImage && (
                          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${content.bgImage})` }} />
                        )}
                        <h1 className="text-3xl font-extrabold text-white max-w-2xl mt-4" style={{ fontFamily: website.fontFamily === 'sans' ? 'inherit' : website.fontFamily }}>
                          {content.title || 'Hero Title Placeholder'}
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-xl mt-3">{content.subtitle || 'Subheading details goes here.'}</p>
                        {content.ctaText && (
                          <button
                            className="mt-6 px-6 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-all"
                            style={{ backgroundColor: website.primaryColor }}
                          >
                            {content.ctaText}
                          </button>
                        )}
                      </div>
                    )}

                    {sec.type === 'FEATURES' && (
                      <div className="py-12 px-8 bg-zinc-900/30">
                        <div className="text-center mb-8">
                          <h2 className="text-xl font-bold text-white">{content.title || 'Core Pillars'}</h2>
                          <p className="text-zinc-500 text-xs mt-1">{content.subtitle}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          {content.items?.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-lg">
                              <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                              <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                          )) || <p className="text-center text-xs text-zinc-600 col-span-3">No features listed.</p>}
                        </div>
                      </div>
                    )}

                    {sec.type === 'PRICING' && (
                      <div className="py-12 px-8 bg-zinc-900/30">
                        <h2 className="text-xl font-bold text-white text-center mb-8">{content.title || 'Simple Gated Pricing'}</h2>
                        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                          {content.items?.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-5 text-center flex flex-col justify-between">
                              <div>
                                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-1">{item.name}</h3>
                                <p className="text-2xl font-black text-white my-3">{item.price}</p>
                                <ul className="text-left space-y-2 text-xs text-zinc-400 my-4 border-t border-zinc-900 pt-3">
                                  {item.features?.map((f: string, j: number) => (
                                    <li key={j} className="flex items-center gap-1.5">
                                      <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <button
                                className="w-full py-2 rounded-lg text-white font-bold text-xs"
                                style={{ backgroundColor: website.primaryColor }}
                              >
                                Select Plan
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === 'TESTIMONIALS' && (
                      <div className="py-12 px-8 bg-zinc-900/40 text-center">
                        <h2 className="text-xl font-bold text-white mb-8">{content.title || 'Client Testimonials'}</h2>
                        <div className="max-w-2xl mx-auto space-y-4">
                          {content.items?.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-950/50 border border-zinc-850 rounded-xl p-6 italic text-sm text-zinc-300">
                              "{item.quote}"
                              <p className="mt-4 text-xs font-bold not-italic text-zinc-500">— {item.author}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === 'CONTACT_FORM' && (
                      <div className="py-12 px-8 bg-zinc-900/50 max-w-xl mx-auto my-4 rounded-xl border border-zinc-850">
                        <div className="text-center mb-6">
                          <h2 className="text-lg font-bold text-white">{content.title || 'Send Message'}</h2>
                          <p className="text-xs text-zinc-500 mt-1">{content.subtitle}</p>
                        </div>
                        <div className="space-y-3">
                          <input type="text" disabled placeholder="Your Name" className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2 text-xs text-white rounded focus:outline-none" />
                          <input type="email" disabled placeholder="Your Email Address" className="w-full bg-zinc-950 border border-zinc-850 px-3 py-2 text-xs text-white rounded focus:outline-none" />
                          <textarea rows={3} disabled placeholder="Message content..." className="w-full bg-zinc-950 border border-zinc-850 p-3 text-xs text-white rounded focus:outline-none" />
                          <button
                            className="w-full py-2 rounded-lg text-white font-bold text-xs"
                            style={{ backgroundColor: website.primaryColor }}
                          >
                            {content.buttonText || 'Send'}
                          </button>
                        </div>
                      </div>
                    )}

                    {sec.type === 'RICH_TEXT' && (
                      <div className="py-12 px-8 max-w-3xl mx-auto prose prose-invert">
                        <h2 className="text-xl font-bold text-white mb-4">{content.title || 'Information Section'}</h2>
                        <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{content.body || 'Standard text block content.'}</p>
                      </div>
                    )}

                    {sec.type === 'COURSE_GRID' && (
                      <div className="py-12 px-8 bg-zinc-900/40">
                        <div className="text-center mb-8">
                          <h2 className="text-xl font-bold text-white">Course Catalog</h2>
                          <p className="text-xs text-zinc-500 mt-1">Unlock course lessons via dynamic gated access.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                          {website.courses?.map((c: any) => (
                            <div key={c.id} className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-5 flex flex-col justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-white mb-2">{c.title}</h3>
                                <p className="text-zinc-500 text-xs line-clamp-2">{c.description}</p>
                              </div>
                              <div className="flex justify-between items-center mt-4 border-t border-zinc-900 pt-3">
                                <span className="text-sm font-bold text-white">${c.price}</span>
                                <button className="px-3 py-1.5 rounded bg-purple-600 text-white font-semibold text-[10px]">Enroll Course</button>
                              </div>
                            </div>
                          )) || <p className="text-center text-xs text-zinc-600 col-span-2">No courses configured.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: Content Inspector for Selected Section */}
      {editingSectionId && inspectorContent && (
        <div className="w-80 border-l border-zinc-800 bg-zinc-900/50 flex flex-col h-full select-none animate-slide-in">
          <div className="border-b border-zinc-800 p-3 bg-zinc-900 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Edit className="h-4 w-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Section Editor</h3>
            </div>
            <button
              onClick={() => setEditingSectionId(null)}
              className="rounded p-1 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title / Subtitle inputs common to most sections */}
            {inspectorContent.title !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Section Title</label>
                <input
                  type="text"
                  value={inspectorContent.title}
                  onChange={(e) => setInspectorContent({ ...inspectorContent, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {inspectorContent.subtitle !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={inspectorContent.subtitle}
                  onChange={(e) => setInspectorContent({ ...inspectorContent, subtitle: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {/* HERO Specific Content */}
            {inspectorContent.bgImage !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={inspectorContent.bgImage}
                  onChange={(e) => setInspectorContent({ ...inspectorContent, bgImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {inspectorContent.ctaText !== undefined && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">CTA Label</label>
                  <input
                    type="text"
                    value={inspectorContent.ctaText}
                    onChange={(e) => setInspectorContent({ ...inspectorContent, ctaText: e.target.value })}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={inspectorContent.ctaUrl}
                    onChange={(e) => setInspectorContent({ ...inspectorContent, ctaUrl: e.target.value })}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* FEATURES/TESTIMONIALS/PRICING Specific items editor */}
            {inspectorContent.items !== undefined && (
              <div className="space-y-3 pt-3 border-t border-zinc-850">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-zinc-500">Items List</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...(inspectorContent.items || [])]
                      newItems.push({ title: 'New Item', desc: 'Add description.', name: 'Starter', price: '$29', quote: 'Great feedback.', author: 'Alex' })
                      setInspectorContent({ ...inspectorContent, items: newItems })
                    }}
                    className="text-[9px] bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 rounded"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {inspectorContent.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-zinc-950 rounded border border-zinc-850 relative">
                      <button
                        onClick={() => {
                          const newItems = inspectorContent.items.filter((_: any, i: number) => i !== idx)
                          setInspectorContent({ ...inspectorContent, items: newItems })
                        }}
                        className="absolute top-1 right-1 text-zinc-650 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {/* Render fields dynamically based on exists */}
                      {item.title !== undefined && (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...inspectorContent.items]
                            newItems[idx].title = e.target.value
                            setInspectorContent({ ...inspectorContent, items: newItems })
                          }}
                          placeholder="Title"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white mb-1.5"
                        />
                      )}

                      {item.desc !== undefined && (
                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={(e) => {
                            const newItems = [...inspectorContent.items]
                            newItems[idx].desc = e.target.value
                            setInspectorContent({ ...inspectorContent, items: newItems })
                          }}
                          placeholder="Description"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white"
                        />
                      )}

                      {item.name !== undefined && (
                        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...inspectorContent.items]
                              newItems[idx].name = e.target.value
                              setInspectorContent({ ...inspectorContent, items: newItems })
                            }}
                            placeholder="Plan name"
                            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...inspectorContent.items]
                              newItems[idx].price = e.target.value
                              setInspectorContent({ ...inspectorContent, items: newItems })
                            }}
                            placeholder="Price"
                            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      )}

                      {item.quote !== undefined && (
                        <textarea
                          rows={2}
                          value={item.quote}
                          onChange={(e) => {
                            const newItems = [...inspectorContent.items]
                            newItems[idx].quote = e.target.value
                            setInspectorContent({ ...inspectorContent, items: newItems })
                          }}
                          placeholder="Quote"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-xs text-white mb-1.5"
                        />
                      )}

                      {item.author !== undefined && (
                        <input
                          type="text"
                          value={item.author}
                          onChange={(e) => {
                            const newItems = [...inspectorContent.items]
                            newItems[idx].author = e.target.value
                            setInspectorContent({ ...inspectorContent, items: newItems })
                          }}
                          placeholder="Author"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RICH_TEXT Body area */}
            {inspectorContent.body !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Body Text Content</label>
                <textarea
                  rows={10}
                  value={inspectorContent.body}
                  onChange={(e) => setInspectorContent({ ...inspectorContent, body: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {/* CONTACT_FORM Specifics */}
            {inspectorContent.buttonText !== undefined && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Submit Button Label</label>
                  <input
                    type="text"
                    value={inspectorContent.buttonText}
                    onChange={(e) => setInspectorContent({ ...inspectorContent, buttonText: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Capture Action Type</label>
                  <select
                    value={inspectorContent.formType || 'CONTACT'}
                    onChange={(e) => setInspectorContent({ ...inspectorContent, formType: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="CONTACT">Contact General Inquiry</option>
                    <option value="ADMISSION">School Admission Form</option>
                    <option value="NEWSLETTER">Newsletter Subscription</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            <button
              onClick={handleSaveSectionContent}
              disabled={isSaving}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Apply Layout Edits'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
