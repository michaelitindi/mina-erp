import { getWebsite } from '@/app/actions/website-builder'
import { checkModuleAccess } from '@/lib/module-access'
import { EditorClient } from '@/components/website-builder/editor-client'
import { Globe, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function WebsiteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const website = await getWebsite(id)

  if (!website) {
    notFound()
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      {/* Visual Editor Header controls */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-4 flex items-center justify-between z-20 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/website-builder"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-xs">{website.name}</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">{website.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">Live Domain:</span>
          <Link
            href={`/site/${website.slug}`}
            target="_blank"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            /site/{website.slug}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Interactive visual layout editor */}
      <div className="flex-1 min-h-0">
        <EditorClient website={website} />
      </div>
    </div>
  )
}
