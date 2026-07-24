'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEnabledModules, resolveModuleDependencies } from '@/app/actions/onboarding'
import { ALL_MODULES, ModuleType } from '@/lib/modules'
import { Check, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function ModulesClient({ initialModules }: { initialModules: string[] }) {
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(initialModules as ModuleType[])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const toggleModule = (moduleId: ModuleType) => {
    setSelectedModules(prev => {
      const isCurrentlySelected = prev.includes(moduleId)
      if (isCurrentlySelected) {
        return prev.filter(m => m !== moduleId)
      } else {
        const resolved = resolveModuleDependencies([...prev, moduleId]) as ModuleType[]
        return resolved
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedModules.length === 0) {
      setError('Please select at least one module')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateEnabledModules(selectedModules)
      setSuccess('Modules configuration updated successfully! The sidebar navigation links have refreshed.')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to save module preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/settings"
          className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Modules Management
          </h1>
          <p className="text-zinc-500 text-sm">Enable or disable ERP modules to customize your sidebar cockpit</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {ALL_MODULES.map(module => {
          const isSelected = selectedModules.includes(module.id)
          return (
            <button
              key={module.id}
              onClick={() => toggleModule(module.id)}
              className={`
                relative group p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer
                ${isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-zinc-850 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                }
              `}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 transition-transform group-hover:scale-110 shadow-inner
                ${isSelected ? 'bg-blue-500/20' : 'bg-zinc-800/50'}
              `}>
                {module.icon}
              </div>

              {/* Text */}
              <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                {module.name}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2">
                {module.description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-900">
        <button
          onClick={handleSubmit}
          disabled={isLoading || selectedModules.length === 0}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving Modules...
            </>
          ) : (
            'Apply Modules Configuration'
          )}
        </button>
      </div>
    </div>
  )
}
