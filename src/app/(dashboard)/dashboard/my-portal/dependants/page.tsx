'use client'

import { useState, useEffect } from 'react'
import { getMyEmployee, addDependant, deleteDependant } from '@/app/actions/self-service'
import { Users, Plus, Trash2, User } from 'lucide-react'

type Dependant = {
  id: string
  firstName: string
  lastName: string
  relationship: string
  dateOfBirth: Date | null
  gender: string | null
  isEmergencyContact: boolean
  phone: string | null
}

export default function DependantsPage() {
  const [loading, setLoading] = useState(true)
  const [dependants, setDependants] = useState<Dependant[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    relationship: 'SPOUSE' as 'SPOUSE' | 'CHILD' | 'PARENT' | 'OTHER',
    dateOfBirth: '',
    gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
    isEmergencyContact: false,
    phone: '',
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  async function loadData() {
    const emp = await getMyEmployee()
    if (emp?.dependants) {
      setDependants(emp.dependants)
    }
    setLoading(false)
  }
  
  async function handleAdd() {
    if (!form.firstName || !form.lastName) {
      alert('Please enter first and last name')
      return
    }
    
    setSaving(true)
    try {
      await addDependant({
        ...form,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
        gender: form.gender || null,
      })
      setForm({ firstName: '', lastName: '', relationship: 'SPOUSE', dateOfBirth: '', gender: '', isEmergencyContact: false, phone: '' })
      setShowForm(false)
      await loadData()
    } catch (error) {
      alert('Failed to add dependant')
    }
    setSaving(false)
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this dependant?')) return
    
    try {
      await deleteDependant(id)
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
          <Users className="h-6 w-6 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Dependants</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Dependant
        </button>
      </div>
      
      <p className="text-sm text-slate-400">
        Add family members for benefits and tax purposes.
      </p>
      
      {/* Add Form */}
      {showForm && (
        <div className="rounded-lg border border-slate-600 bg-slate-700/30 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value as typeof form.relationship })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              >
                <option value="SPOUSE">Spouse</option>
                <option value="CHILD">Child</option>
                <option value="PARENT">Parent</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              >
                <option value="">Not specified</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="emergency"
              checked={form.isEmergencyContact}
              onChange={(e) => setForm({ ...form, isEmergencyContact: e.target.checked })}
              className="rounded border-slate-600"
            />
            <label htmlFor="emergency" className="text-sm text-slate-300">Is emergency contact</label>
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
      {dependants.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No dependants added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dependants.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{dep.firstName} {dep.lastName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    {dep.relationship}
                  </span>
                  {dep.isEmergencyContact && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      Emergency
                    </span>
                  )}
                </div>
                {dep.dateOfBirth && (
                  <div className="text-sm text-slate-400">
                    Born: {new Date(dep.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(dep.id)}
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
