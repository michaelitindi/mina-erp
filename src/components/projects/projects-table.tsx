'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteProject, updateProjectStatus } from '@/app/actions/projects'
import { Trash2, PlayCircle, PauseCircle, CheckCircle, Eye } from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string
  status: string
  priority: string
  progress: number
  startDate: Date | null
  endDate: Date | null
  budget: number | { toNumber: () => number } | null
  _count?: { tasks: number; resources: number }
}

const getAmount = (amt: number | { toNumber: () => number } | null): number => {
  if (!amt) return 0
  return typeof amt === 'number' ? amt : amt?.toNumber?.() || 0
}

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    PLANNING: 'text-zinc-500 bg-zinc-500/10',
    ACTIVE: 'text-green-400 bg-green-400/10',
    ON_HOLD: 'text-yellow-400 bg-yellow-400/10',
    COMPLETED: 'text-blue-400 bg-blue-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
  }

  const priorityColors: Record<string, string> = {
    LOW: 'text-zinc-500',
    MEDIUM: 'text-blue-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  }

  async function handleStatusChange(id: string, status: string) {
    setProcessingId(id)
    try { await updateProjectStatus(id, status); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    setProcessingId(id)
    try { await deleteProject(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Progress</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase">Tasks</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-6 py-4">
                <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                  <p className="text-sm font-medium text-white">{project.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{project.projectNumber}</p>
                </Link>
              </td>
              <td className="px-6 py-4"><span className={`text-sm font-medium ${priorityColors[project.priority]}`}>{project.priority}</span></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500">{project.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center"><span className="text-sm text-zinc-400">{project._count?.tasks || 0}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>{project.status.replace('_', ' ')}</span></td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                  {project.status === 'PLANNING' && (
                    <button onClick={() => handleStatusChange(project.id, 'ACTIVE')} disabled={processingId === project.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Start">
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  )}
                  {project.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => handleStatusChange(project.id, 'ON_HOLD')} disabled={processingId === project.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-yellow-600/20 hover:text-yellow-400 transition-colors disabled:opacity-50" title="Pause">
                        <PauseCircle className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleStatusChange(project.id, 'COMPLETED')} disabled={processingId === project.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-blue-600/20 hover:text-blue-400 transition-colors disabled:opacity-50" title="Complete">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {project.status === 'ON_HOLD' && (
                    <button onClick={() => handleStatusChange(project.id, 'ACTIVE')} disabled={processingId === project.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-green-600/20 hover:text-green-400 transition-colors disabled:opacity-50" title="Resume">
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  )}
                  <Link href={`/dashboard/projects/${project.id}`} className="rounded-lg p-1.5 text-zinc-500 hover:bg-blue-600/20 hover:text-blue-400 transition-colors" title="View">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(project.id)} disabled={processingId === project.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
