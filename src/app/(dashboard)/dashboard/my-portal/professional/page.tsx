'use client'

import { useState, useEffect } from 'react'
import { getMyEmployee, addCertification, deleteCertification } from '@/app/actions/self-service'
import { GraduationCap, Plus, Trash2, Award, Calendar, Clock } from 'lucide-react'

type Certification = {
  id: string
  name: string
  type: string
  issuer: string | null
  issueDate: Date | null
  expiryDate: Date | null
  credentialId: string | null
}

export default function ProfessionalPage() {
  const [loading, setLoading] = useState(true)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'CERTIFICATION' as 'CERTIFICATION' | 'DEGREE' | 'SKILL' | 'LICENSE',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  async function loadData() {
    const emp = await getMyEmployee()
    if (emp?.certifications) {
      setCertifications(emp.certifications)
    }
    setLoading(false)
  }
  
  async function handleAdd() {
    if (!form.name) {
      alert('Please enter a name')
      return
    }
    
    setSaving(true)
    try {
      await addCertification({
        ...form,
        issueDate: form.issueDate ? new Date(form.issueDate) : null,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : null,
      })
      setForm({ name: '', type: 'CERTIFICATION', issuer: '', issueDate: '', expiryDate: '', credentialId: '' })
      setShowForm(false)
      await loadData()
    } catch (error) {
      alert('Failed to add certification')
    }
    setSaving(false)
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this?')) return
    
    try {
      await deleteCertification(id)
      await loadData()
    } catch (error) {
      alert('Failed to delete')
    }
  }
  
  if (loading) {
    return <div className="text-zinc-500">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Professional Details</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      
      {/* Add Form */}
      {showForm && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
                placeholder="e.g., AWS Solutions Architect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
              >
                <option value="CERTIFICATION">Certification</option>
                <option value="DEGREE">Degree</option>
                <option value="SKILL">Skill</option>
                <option value="LICENSE">License</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Issuer</label>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
                placeholder="e.g., Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Credential ID</label>
              <input
                type="text"
                value={form.credentialId}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Issue Date</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* List */}
      {certifications.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No certifications or degrees added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all shadow-sm group">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-lg">{cert.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400">
                        {cert.type}
                      </span>
                    </div>
                    {cert.issuer && <div className="text-sm text-zinc-400 font-medium mt-0.5">{cert.issuer}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 ml-12">
                  {cert.issueDate && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                  )}
                  {cert.expiryDate && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-400/50" />
                      Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="text-[10px] text-zinc-600 font-mono">
                      ID: {cert.credentialId}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(cert.id)}
                className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}
