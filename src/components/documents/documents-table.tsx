'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDocument, archiveDocument } from '@/app/actions/documents'
import { Trash2, Archive, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react'

interface Document {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  category: string | null
  status: string
  createdAt: Date
  _count?: { versions: number }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(fileType: string) {
  if (['pdf', 'doc', 'docx'].includes(fileType)) return FileText
  if (['xls', 'xlsx', 'csv'].includes(fileType)) return FileSpreadsheet
  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) return FileImage
  return File
}

export function DocumentsTable({ documents }: { documents: Document[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  const statusColors: Record<string, string> = {
    ACTIVE: 'text-green-400 bg-green-400/10',
    ARCHIVED: 'text-purple-400 bg-purple-400/10',
    DELETED: 'text-red-400 bg-red-400/10',
  }

  const categoryColors: Record<string, string> = {
    CONTRACT: 'text-blue-400',
    INVOICE: 'text-green-400',
    REPORT: 'text-purple-400',
    POLICY: 'text-orange-400',
    OTHER: 'text-zinc-500',
  }

  async function handleArchive(id: string) {
    setProcessingId(id)
    try { await archiveDocument(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document?')) return
    setProcessingId(id)
    try { await deleteDocument(id); router.refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessingId(null) }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Document</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Category</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Size</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.fileType)
            return (
              <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-zinc-500" />
                    <div>
                      <p className="text-sm font-medium text-white">{doc.title}</p>
                      <p className="text-xs text-zinc-500">{doc.fileName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${categoryColors[doc.category || 'OTHER']}`}>
                    {doc.category || 'Other'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right"><span className="text-sm text-zinc-400">{formatFileSize(doc.fileSize)}</span></td>
                <td className="px-6 py-4"><span className="text-sm text-zinc-400">{new Date(doc.createdAt).toLocaleDateString()}</span></td>
                <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>{doc.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    {doc.status === 'ACTIVE' && (
                      <button onClick={() => handleArchive(doc.id)} disabled={processingId === doc.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-purple-600/20 hover:text-purple-400 transition-colors disabled:opacity-50" title="Archive">
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(doc.id)} disabled={processingId === doc.id} className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
