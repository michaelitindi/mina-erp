'use client'

import { useState, useEffect } from 'react'
import { getMyEmployee, addCertification, deleteCertification } from '@/app/actions/self-service'
import { GraduationCap, Plus, Trash2, Award, Calendar } from 'lucide-react'

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
    return <div className="text-slate-400">Loading...</div>
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
        <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                placeholder="e.g., AWS Solutions Architect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              >
                <option value="CERTIFICATION">Certification</option>
                <option value="DEGREE">Degree</option>
                <option value="SKILL">Skill</option>
                <option value="LICENSE">License</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Issuer</label>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                placeholder="e.g., Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Credential ID</label>
              <input
                type="text"
                value={form.credentialId}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Issue Date</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
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
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* List */}
      {certifications.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No certifications or degrees added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{cert.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    {cert.type}
                  </span>
                </div>
                {cert.issuer && <div className="text-sm text-slate-400">{cert.issuer}</div>}
                {cert.issueDate && (
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(cert.issueDate).toLocaleDateString()}
                    {cert.expiryDate && ` - ${new Date(cert.expiryDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(cert.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
