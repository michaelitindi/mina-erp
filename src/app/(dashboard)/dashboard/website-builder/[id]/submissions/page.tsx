import { getWebsite } from '@/app/actions/website-builder'
import { checkModuleAccess } from '@/lib/module-access'
import { SubmissionsClient } from '@/components/website-builder/submissions-client'
import { notFound } from 'next/navigation'

export default async function SubmissionsDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const website = await getWebsite(id)

  if (!website) {
    notFound()
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <SubmissionsClient
        initialSubmissions={website.submissions}
        websiteId={website.id}
        websiteName={website.name}
      />
    </div>
  )
}
