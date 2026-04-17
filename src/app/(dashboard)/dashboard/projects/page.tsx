import { getProjects, getProjectStats } from '@/app/actions/projects'
import { checkModuleAccess } from '@/lib/module-access'
import { ProjectsTable } from '@/components/projects/projects-table'
import { CreateProjectButton } from '@/components/projects/project-buttons'
import { FolderKanban, PlayCircle, CheckCircle, Clock } from 'lucide-react'

export default async function ProjectsPage() {
  await checkModuleAccess('PROJECTS')
  const [projects, stats] = await Promise.all([getProjects(), getProjectStats()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-zinc-500">Track projects and tasks</p>
        </div>
        <CreateProjectButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2"><FolderKanban className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-sm text-zinc-500">Total Projects</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2"><PlayCircle className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-sm text-zinc-500">Active</p><p className="text-2xl font-bold text-white">{stats.active}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2"><CheckCircle className="h-5 w-5 text-purple-400" /></div>
            <div><p className="text-sm text-zinc-500">Completed</p><p className="text-2xl font-bold text-white">{stats.completed}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2"><Clock className="h-5 w-5 text-orange-400" /></div>
            <div><p className="text-sm text-zinc-500">In Progress</p><p className="text-2xl font-bold text-white">{stats.total - stats.completed}</p></div>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">No projects yet</h3>
          <p className="mt-2 text-zinc-500">Create your first project to start tracking tasks.</p>
          <div className="mt-6"><CreateProjectButton /></div>
        </div>
      ) : (
        <ProjectsTable projects={projects} />
      )}
    </div>
  )
}
