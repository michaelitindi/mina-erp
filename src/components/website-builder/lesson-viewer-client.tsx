'use client'

import { useState } from 'react'
import { Lock, Play, FileText, CheckCircle, Sparkles, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function LessonViewerClient({
  course,
  lesson: activeLesson,
  website,
  slug
}: {
  course: any
  lesson: any
  website: any
  slug: string
}) {
  const [hasPaid, setHasPaid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const isLocked = !activeLesson.isFree && !hasPaid

  const handleSimulatePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setHasPaid(true)
      setPaymentSuccess(true)
    }, 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-4 items-start select-none">
      {/* 1. Lessons Navigation Sidebar */}
      <div className="md:col-span-1 bg-zinc-900/30 border border-zinc-900 rounded-xl overflow-hidden space-y-1">
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-900 font-bold text-xs text-zinc-400 uppercase tracking-wider">
          Syllabus Index
        </div>
        <div className="divide-y divide-zinc-900/60 max-h-[500px] overflow-y-auto">
          {course.lessons.map((les: any, idx: number) => {
            const isCurrent = les.id === activeLesson.id
            const showLock = !les.isFree && !hasPaid

            return (
              <Link
                key={les.id}
                href={`/site/${slug}/courses/${course.slug}/lessons/${les.slug}`}
                className={`p-3 text-left block transition-all ${
                  isCurrent ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-start gap-2 text-xs">
                  <span className="truncate flex items-center gap-1.5 font-medium">
                    <span className="text-[10px] text-zinc-650 font-mono">0{idx + 1}</span>
                    {les.title}
                  </span>
                  {showLock ? (
                    <Lock className="h-3 w-3 text-zinc-650 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Play className="h-3 w-3 text-purple-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 2. Main Lesson Media Display & Reading Canvas */}
      <div className="md:col-span-3 space-y-6">
        {isLocked ? (
          /* Gated Lock Screen */
          <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-12 text-center max-w-2xl mx-auto space-y-5">
            <Lock className="h-12 w-12 text-purple-400 mx-auto animate-bounce" />
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Gated Lesson Content</span>
              <h2 className="text-xl font-bold text-white">Enroll in {course.title}</h2>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                This lesson is locked. Purchase lifetime access to unlock all lessons, videos, and syllabus materials.
              </p>
            </div>

            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 max-w-md mx-auto space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Course Price:</span>
                <span className="font-black text-white">${course.price.toString()}</span>
              </div>
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  'Securing transaction...'
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Unlock Course Content
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Unlocked Lesson Screen */
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6">
            {paymentSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Purchase successful! All premium bootcamp course lessons have been unlocked.</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Active Module:</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  {activeLesson.isFree ? 'Free Preview' : 'Premium Access'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{activeLesson.title}</h2>
            </div>

            {/* Video frame if videoUrl exists */}
            {activeLesson.videoUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-850 bg-zinc-950 flex items-center justify-center">
                <iframe
                  src={activeLesson.videoUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-zinc-850 bg-zinc-950/40 flex flex-col items-center justify-center text-zinc-600">
                <FileText className="h-8 w-8 text-zinc-755 mb-2" />
                <span className="text-xs">This lesson consists of written learning materials below.</span>
              </div>
            )}

            {/* Lesson content body */}
            <div className="prose prose-invert max-w-none pt-4 border-t border-zinc-900">
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                {activeLesson.content}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
