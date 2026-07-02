import { getWebsites } from '@/app/actions/website-builder'
import { CreateWebsiteModal } from '@/components/website-builder/create-website-modal'
import { Globe, FileText, GraduationCap, ArrowRight, Settings, Plus, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function WebsiteBuilderDashboard() {
  const websites = await getWebsites()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            Website Builder
          </h1>
          <p className="text-zinc-500 text-sm">Create, generate, and visually structure landing pages and course portals</p>
        </div>
        <CreateWebsiteModal />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><Globe className="h-5 w-5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-zinc-500">Websites</p>
              <p className="text-xl font-bold text-white">{websites.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><FileText className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xs text-zinc-500">Total Pages</p>
              <p className="text-xl font-bold text-white">
                {websites.reduce((acc, curr) => acc + curr.pages.length, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><GraduationCap className="h-5 w-5 text-purple-400" /></div>
            <div>
              <p className="text-xs text-zinc-500">Total Courses</p>
              <p className="text-xl font-bold text-white">
                {websites.reduce((acc, curr) => acc + curr._count.courses, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2"><FileText className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <p className="text-xs text-zinc-500">Form Submissions</p>
              <p className="text-xl font-bold text-white">
                {websites.reduce((acc, curr) => acc + curr._count.submissions, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {websites.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center max-w-2xl mx-auto mt-8">
          <Globe className="mx-auto h-16 w-16 text-zinc-700 animate-pulse" />
          <h3 className="mt-4 text-lg font-bold text-white">No websites generated yet</h3>
          <p className="mt-2 text-zinc-500 text-sm max-w-md mx-auto">
            Use our AI Website Architect to build highly optimized course pages, school landing portals, or dynamic forms in seconds.
          </p>
          <div className="mt-6">
            <CreateWebsiteModal />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {websites.map((web) => (
            <div key={web.id} className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all p-5 hover:border-zinc-750">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 mb-2 inline-block">
                    {web.type}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{web.name}</h3>
                  <Link
                    href={`/site/${web.slug}`}
                    target="_blank"
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    /site/{web.slug}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: web.primaryColor, borderColor: web.primaryColor }}
                />
              </div>

              <p className="text-zinc-500 text-xs line-clamp-2 mb-4 min-h-[32px]">{web.description || 'No description provided.'}</p>

              <div className="grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-4 mb-4 text-center">
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase font-bold">Pages</p>
                  <p className="text-white text-sm font-semibold">{web.pages.length}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase font-bold">Courses</p>
                  <p className="text-white text-sm font-semibold">{web._count.courses}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] uppercase font-bold">Submissions</p>
                  <p className="text-white text-sm font-semibold">{web._count.submissions}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/website-builder/${web.id}/editor`}
                  className="flex-1 text-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Edit Layout
                </Link>
                <Link
                  href={`/dashboard/website-builder/${web.id}/submissions`}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                  title="Form Submissions"
                >
                  <FileText className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
