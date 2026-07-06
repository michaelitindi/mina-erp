import { prisma } from '@/lib/prisma'
import { submitWebForm } from '@/app/actions/website-builder'
import { notFound } from 'next/navigation'
import { Check, Mail, Phone, MapPin, Play, Lock, FileText, ChevronRight, Sparkles, Send, Calendar, Clock, BookOpen, User, HelpCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { WebFormClient } from '@/components/website-builder/web-form-client'
import { LessonViewerClient } from '@/components/website-builder/lesson-viewer-client'
import { WebBookingClient } from '@/components/website-builder/web-booking-client'

export default async function PublicWebsiteRenderPage({
  params
}: {
  params: Promise<{ slug: string; path?: string[] }>
}) {
  const { slug, path } = await params
  
  // Fetch website with pages, sections, courses, and lessons
  const website = await prisma.website.findFirst({
    where: { slug, isActive: true },
    include: {
      pages: {
        where: { isActive: true },
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      courses: {
        where: { isPublished: true },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      blogPosts: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' }
      },
      bookings: true
    }
  })

  if (!website) {
    notFound()
  }

  // Parse header and footer configs
  let headerLogo = website.name
  let navLinks = [
    { label: 'Home', url: `/site/${slug}` },
    { label: 'About', url: `/site/${slug}/about` },
    { label: 'Contact', url: `/site/${slug}/contact` }
  ]

  try {
    if (website.headerConfig) {
      const h = JSON.parse(website.headerConfig)
      if (h.logo) headerLogo = h.logo
      if (h.links) {
        navLinks = h.links.map((link: any) => ({
          label: link.label,
          url: link.url.startsWith('/') ? `/site/${slug}${link.url === '/' ? '' : link.url}` : link.url
        }))
      }
    }
  } catch (e) {}

  let footerCopyright = `© ${new Date().getFullYear()} ${website.name}. All rights reserved.`
  try {
    if (website.footerConfig) {
      const f = JSON.parse(website.footerConfig)
      if (f.copyright) footerCopyright = f.copyright
    }
  } catch (e) {}

  // Determine active view
  let activePage: any = null
  let activeCourse: any = null
  let activeLesson: any = null
  let activePost: any = null

  const isCoursesList = path && path[0] === 'courses' && !path[1]
  const isCourseDetail = path && path[0] === 'courses' && path[1]
  const isBlogList = path && path[0] === 'posts' && !path[1]
  const isBlogDetail = path && path[0] === 'posts' && path[1]
  const isBookingPage = path && path[0] === 'book'

  if (isCoursesList) {
    // Render e-learning course catalog
  } else if (isCourseDetail) {
    const courseSlug = path[1]
    activeCourse = website.courses.find((c) => c.slug === courseSlug)
    if (!activeCourse) notFound()

    // If lesson slug is specified
    if (path[2] === 'lessons' && path[3]) {
      const lessonSlug = path[3]
      activeLesson = activeCourse.lessons.find((l: any) => l.slug === lessonSlug)
      if (!activeLesson) notFound()
    }
  } else if (isBlogList) {
    // Render blog index list
  } else if (isBlogDetail) {
    const postSlug = path[1]
    activePost = website.blogPosts.find((p) => p.slug === postSlug)
    if (!activePost) notFound()
  } else if (isBookingPage) {
    // Render service appointment booking page
  } else {
    // Normal page matching
    const pageSlug = path && path[0] ? path[0] : 'home'
    activePage = website.pages.find((p) => p.slug === pageSlug)
    
    // Fallback: case-insensitive matching
    if (!activePage) {
      activePage = website.pages.find((p) => p.slug.toLowerCase() === pageSlug.toLowerCase())
    }

    if (!activePage) {
      notFound()
    }
  }

  // Font family loader mapping
  let fontStyle = 'font-sans'
  if (website.fontFamily === 'outfit') fontStyle = 'font-sans select-none' // Custom outfit mapping
  else if (website.fontFamily === 'inter') fontStyle = 'font-sans'
  else if (website.fontFamily === 'serif') fontStyle = 'font-serif'
  else if (website.fontFamily === 'mono') fontStyle = 'font-mono'

  return (
    <div className={`min-h-screen bg-zinc-950 text-white flex flex-col justify-between ${fontStyle}`}>
      {/* Custom Global CSS overrides */}
      {website.customCss && (
        <style dangerouslySetInnerHTML={{ __html: website.customCss }} />
      )}

      {/* 1. PUBLIC HEADER / NAVIGATION */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/site/${slug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white">
              {headerLogo.charAt(0)}
            </div>
            <span className="font-bold text-white tracking-tight text-sm uppercase">{headerLogo}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.url}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/site/${slug}/contact`}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              style={{ backgroundColor: website.primaryColor }}
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CANVAS VIEW */}
      <main className="flex-1 bg-zinc-950">
        {/* VIEW A: Course Catalog Grid */}
        {isCoursesList && (
          <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Academy Programs</span>
              <h1 className="text-3xl font-extrabold text-white">Browse Dynamic Learning Bootcamps</h1>
              <p className="text-zinc-500 text-sm max-w-xl mx-auto">
                Secure gated access to lessons, modules, and assessment catalogs. Select a course below to enroll.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {website.courses.map((course) => (
                <div key={course.id} className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-6 flex flex-col justify-between hover:border-zinc-800 transition-all">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                    <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed">{course.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-2">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      <span>{course.lessons.length} Modules / Lessons</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 border-t border-zinc-900 pt-4">
                    <span className="text-lg font-black text-white">${course.price.toString()}</span>
                    <Link
                      href={`/site/${slug}/courses/${course.slug}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white cursor-pointer"
                      style={{ backgroundColor: website.primaryColor }}
                    >
                      View Syllabus
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW B: Course Lessons Syllabus & Viewer Gated Gating */}
        {isCourseDetail && activeCourse && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!activeLesson ? (
              // Course landing dashboard/syllabus view
              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Bootcamp Course</span>
                  <h1 className="text-3xl font-extrabold text-white">{activeCourse.title}</h1>
                  <p className="text-zinc-400 text-sm leading-relaxed">{activeCourse.description}</p>

                  <div className="space-y-3 pt-4">
                    <h3 className="text-sm font-bold text-zinc-300">Course Syllabus & Curriculum</h3>
                    <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-900/10">
                      {activeCourse.lessons.map((les: any, idx: number) => (
                        <div key={les.id} className="p-4 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="text-xs text-zinc-600 font-bold font-mono">0{idx + 1}</span>
                            <span className="text-zinc-200 font-medium">{les.title}</span>
                          </span>
                          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                            {les.isFree ? 'Free Preview' : 'Gated Premium'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing / Buy panel */}
                <div className="md:col-span-1 rounded-xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-4">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Lifetime Access</p>
                  <p className="text-3xl font-black text-white">${activeCourse.price.toString()}</p>
                  <p className="text-xs text-zinc-400">
                    Includes video modules, resource material, dynamic community boards, and certificate badges.
                  </p>
                  <Link
                    href={`/site/${slug}/courses/${activeCourse.slug}/lessons/${activeCourse.lessons[0]?.slug}`}
                    className="w-full py-2.5 rounded-lg text-xs font-bold text-white text-center block cursor-pointer"
                    style={{ backgroundColor: website.primaryColor }}
                  >
                    Start Learning
                  </Link>
                </div>
              </div>
            ) : (
              // Active Lesson Video & Interactive Player View
              <LessonViewerClient
                course={activeCourse}
                lesson={activeLesson}
                website={website}
                slug={slug}
              />
            )}
          </div>
        )}

        {/* VIEW D: Blog Posts Index */}
        {isBlogList && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-rose-500">Publications</span>
              <h1 className="text-3xl font-extrabold text-white">Articles & Insights</h1>
              <p className="text-zinc-500 text-sm max-w-xl mx-auto">
                Browse our recent guides, industry publications, and thoughts.
              </p>
            </div>

            {website.blogPosts.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">No articles published yet.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {website.blogPosts.map((post) => (
                  <div key={post.id} className="rounded-xl border border-zinc-900 bg-zinc-900/30 overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all">
                    {post.coverImage && (
                      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
                    )}
                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h2 className="text-lg font-bold text-white leading-tight">{post.title}</h2>
                        <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed">{post.summary}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-zinc-900 mt-4">
                        <span className="text-[10px] text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <Link
                          href={`/site/${slug}/posts/${post.slug}`}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                          Read Article <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW E: Blog Post Detail */}
        {isBlogDetail && activePost && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 animate-fade-in">
            <Link
              href={`/site/${slug}/posts`}
              className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Articles
            </Link>

            {activePost.coverImage && (
              <div className="w-full h-80 rounded-xl bg-cover bg-center shadow-lg" style={{ backgroundImage: `url(${activePost.coverImage})` }} />
            )}

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{activePost.title}</h1>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Published by Admin</span>
                <span>•</span>
                <span>{new Date(activePost.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <article className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap border-t border-zinc-900 pt-6">
              {activePost.content}
            </article>
          </div>
        )}

        {/* VIEW F: Service Booking Page */}
        {isBookingPage && (
          <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
            <WebBookingClient
              websiteId={website.id}
              title="Request Appointment Slot"
              subtitle="Provide details to request a custom consulting slot"
              primaryColor={website.primaryColor}
            />
          </div>
        )}

        {/* VIEW C: Visual section builder page render */}
        {activePage && (
          <div className="space-y-0">
            {activePage.sections.map((sec: any) => {
              let parsedContent = {}
              try {
                parsedContent = JSON.parse(sec.content)
              } catch (e) {
                parsedContent = {}
              }
              const content: any = parsedContent

              return (
                <section key={sec.id} className="relative">
                  {sec.type === 'HERO' && (
                    <div className="py-24 md:py-32 px-4 text-center bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden flex flex-col items-center relative border-b border-zinc-900/40">
                      {content.bgImage && (
                        <div className="absolute inset-0 bg-cover bg-center opacity-10 select-none pointer-events-none" style={{ backgroundImage: `url(${content.bgImage})` }} />
                      )}
                      <h1
                        className="text-4xl md:text-5xl font-extrabold text-white max-w-3xl leading-tight"
                        style={{ fontFamily: website.fontFamily === 'sans' ? 'inherit' : website.fontFamily }}
                      >
                        {content.title}
                      </h1>
                      <p className="text-zinc-400 text-sm md:text-base max-w-2xl mt-4 leading-relaxed">{content.subtitle}</p>
                      {content.ctaText && (
                        <Link
                          href={content.ctaUrl || `/site/${slug}/contact`}
                          className="mt-8 px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-xl shadow-blue-900/10 cursor-pointer"
                          style={{ backgroundColor: website.primaryColor }}
                        >
                          {content.ctaText}
                        </Link>
                      )}
                    </div>
                  )}

                  {sec.type === 'FEATURES' && (
                    <div className="py-20 max-w-6xl mx-auto px-4 border-b border-zinc-900/40">
                      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{content.title}</h2>
                        <p className="text-zinc-500 text-xs md:text-sm">{content.subtitle}</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-3">
                        {content.items?.map((item: any, i: number) => (
                          <div key={i} className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-xl hover:border-zinc-800 transition-all">
                            <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'PRICING' && (
                    <div className="py-20 max-w-6xl mx-auto px-4 border-b border-zinc-900/40">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12">{content.title}</h2>
                      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        {content.items?.map((item: any, i: number) => (
                          <div key={i} className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 text-center flex flex-col justify-between hover:border-zinc-850 transition-all">
                            <div>
                              <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-500 mb-1">{item.name}</h3>
                              <p className="text-3xl font-black text-white my-4">{item.price}</p>
                              <ul className="text-left space-y-3 text-xs text-zinc-400 my-6 border-t border-zinc-900/60 pt-4">
                                {item.features?.map((f: string, j: number) => (
                                  <li key={j} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button
                              className="w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                              style={{ backgroundColor: website.primaryColor }}
                            >
                              Get Started
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'TESTIMONIALS' && (
                    <div className="py-20 bg-zinc-900/20 text-center border-b border-zinc-900/40">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-12">{content.title}</h2>
                      <div className="max-w-3xl mx-auto px-4 space-y-6">
                        {content.items?.map((item: any, i: number) => (
                          <div key={i} className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-8 italic text-sm md:text-base text-zinc-300 relative">
                            <span className="text-6xl text-zinc-800 font-serif absolute -top-4 left-4 select-none">“</span>
                            "{item.quote}"
                            <p className="mt-4 text-xs font-bold not-italic text-zinc-500">— {item.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'CONTACT_FORM' && (
                    <div className="py-20 px-4 max-w-lg mx-auto border-b border-zinc-900/40">
                      <div className="bg-zinc-900/40 border border-zinc-900 p-6 md:p-8 rounded-2xl">
                        <WebFormClient
                          websiteId={website.id}
                          formType={content.formType || 'CONTACT'}
                          title={content.title}
                          subtitle={content.subtitle}
                          buttonText={content.buttonText}
                          primaryColor={website.primaryColor}
                        />
                      </div>
                    </div>
                  )}

                  {sec.type === 'RICH_TEXT' && (
                    <div className="py-20 max-w-3xl mx-auto px-4 border-b border-zinc-900/40">
                      <h2 className="text-2xl font-extrabold text-white mb-6">{content.title}</h2>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{content.body}</p>
                    </div>
                  )}

                  {sec.type === 'COURSE_GRID' && (
                    <div className="py-20 max-w-6xl mx-auto px-4 border-b border-zinc-900/40">
                      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Programs Catalog</h2>
                        <p className="text-zinc-500 text-xs md:text-sm">Explore interactive lessons and build professional skills.</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                        {website.courses.map((course) => (
                          <div key={course.id} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all">
                            <div>
                              <h3 className="text-base font-bold text-white mb-2">{course.title}</h3>
                              <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{course.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-6 border-t border-zinc-900/60 pt-4">
                              <span className="text-sm font-bold text-white">${course.price.toString()}</span>
                              <Link
                                href={`/site/${slug}/courses/${course.slug}`}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                                style={{ backgroundColor: website.primaryColor }}
                              >
                                Syllabus
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'BLOG_POSTS' && (
                    <div className="py-20 max-w-6xl mx-auto px-4 border-b border-zinc-900/40">
                      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{content.title || 'Recent Publications'}</h2>
                        <p className="text-zinc-500 text-xs md:text-sm">{content.subtitle || 'Read our latest articles.'}</p>
                      </div>
                      {website.blogPosts.length === 0 ? (
                        <div className="text-center py-6 text-zinc-500 text-xs">No blog posts available.</div>
                      ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {website.blogPosts.slice(0, 3).map((post) => (
                            <div key={post.id} className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between">
                              {post.coverImage && (
                                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
                              )}
                              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                  <h3 className="text-sm font-bold text-white line-clamp-1">{post.title}</h3>
                                  <p className="text-zinc-500 text-xs line-clamp-2 mt-1 leading-relaxed">{post.summary}</p>
                                </div>
                                <div className="flex justify-between items-center border-t border-zinc-900 pt-3 text-[10px] text-zinc-500">
                                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                  <Link href={`/site/${slug}/posts/${post.slug}`} className="text-blue-400 hover:text-blue-300 font-bold flex items-center">
                                    Read <ChevronRight className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {sec.type === 'EVENT_INFO' && (
                    <div className="py-20 max-w-5xl mx-auto px-4 border-b border-zinc-900/40 space-y-8">
                      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{content.title || 'Event Details'}</h2>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl text-center space-y-1">
                          <Calendar className="h-5 w-5 text-blue-500 mx-auto" />
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pt-2">Date & Time</h4>
                          <p className="text-sm font-semibold text-white mt-1">{content.date || 'TBD'}</p>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl text-center space-y-1">
                          <MapPin className="h-5 w-5 text-blue-500 mx-auto" />
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pt-2">Location</h4>
                          <p className="text-sm font-semibold text-white mt-1">{content.location || 'TBD'}</p>
                        </div>
                        <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-xl text-center space-y-1">
                          <Clock className="h-5 w-5 text-blue-500 mx-auto" />
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pt-2">Schedule Tracks</h4>
                          <p className="text-sm font-semibold text-white mt-1">{(content.schedule?.length || 0)} Sessions Listed</p>
                        </div>
                      </div>

                      {content.schedule && content.schedule.length > 0 && (
                        <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl overflow-hidden divide-y divide-zinc-900 max-w-2xl mx-auto">
                          {content.schedule.map((sch: any, idx: number) => (
                            <div key={idx} className="p-4 flex items-center justify-between text-xs md:text-sm">
                              <span className="font-mono text-zinc-500 font-bold">{sch.time}</span>
                              <span className="text-white font-semibold text-right">{sch.event}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {sec.type === 'BOOKING_FORM' && (
                    <div className="py-20 px-4 max-w-lg mx-auto border-b border-zinc-900/40">
                      <WebBookingClient
                        websiteId={website.id}
                        title={content.title}
                        subtitle={content.subtitle}
                        primaryColor={website.primaryColor}
                      />
                    </div>
                  )}

                  {sec.type === 'FAQ_ACCORDION' && (
                    <div className="py-20 max-w-3xl mx-auto px-4 border-b border-zinc-900/40">
                      <div className="text-center mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{content.title || 'Frequently Asked Questions'}</h2>
                        <p className="text-zinc-500 text-xs md:text-sm">{content.subtitle}</p>
                      </div>
                      <div className="space-y-4">
                        {content.faqs?.map((faq: any, idx: number) => (
                          <div key={idx} className="border border-zinc-900 bg-zinc-900/20 p-5 rounded-xl">
                            <h4 className="text-sm font-bold text-white flex items-start gap-2">
                              <HelpCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                              {faq.q}
                            </h4>
                            <p className="text-xs text-zinc-500 mt-2 pl-6 leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'PRICING_TABLE' && (
                    <div className="py-20 max-w-6xl mx-auto px-4 border-b border-zinc-900/40">
                      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{content.title || 'Pricing Plans'}</h2>
                        <p className="text-zinc-500 text-xs md:text-sm">{content.subtitle}</p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                        {content.plans?.map((plan: any, idx: number) => (
                          <div key={idx} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all text-center">
                            <div className="space-y-3">
                              <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-500">{plan.name}</h3>
                              <p className="text-3xl font-black text-white">{plan.price}</p>
                              <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/80 pt-3">{plan.desc}</p>
                            </div>
                            <button
                              className="mt-6 w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                              style={{ backgroundColor: website.primaryColor }}
                            >
                              Get Started
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </main>

      {/* 3. PUBLIC FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
          <p className="text-xs text-zinc-650">{footerCopyright}</p>
          <div className="flex justify-center gap-4 text-xs text-zinc-500">
            <Link href={`/site/${slug}`} className="hover:text-zinc-300">Home</Link>
            <Link href={`/site/${slug}/about`} className="hover:text-zinc-300">About</Link>
            <Link href={`/site/${slug}/contact`} className="hover:text-zinc-300">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
