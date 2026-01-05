'use client'

import { useState } from 'react'
import { getMyEmployee, updateMyProfile } from '@/app/actions/self-service'
import { User, Mail, Phone, MapPin, Shield, Save } from 'lucide-react'

type Employee = Awaited<ReturnType<typeof getMyEmployee>>

export default function ProfilePage() {
  return <ProfileContent />
}

function ProfileContent() {
  const [employee, setEmployee] = useState<Employee>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })
  
  // Load employee data
  useState(() => {
    getMyEmployee().then((emp) => {
      setEmployee(emp)
      if (emp) {
        setForm({
          phone: emp.phone || '',
          address: emp.address || '',
          emergencyContactName: emp.emergencyContactName || '',
          emergencyContactPhone: emp.emergencyContactPhone || '',
        })
      }
    })
  })
  
  async function handleSave() {
    setIsSaving(true)
    try {
      await updateMyProfile(form)
      setIsEditing(false)
      // Refresh data
      const emp = await getMyEmployee()
      setEmployee(emp)
    } catch (error) {
      alert('Failed to save changes')
    }
    setIsSaving(false)
  }
  
  if (!employee) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Personal Information</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </>
          ) : (
            'Edit'
          )}
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Read-only fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
            <div className="flex items-center gap-2 text-white">
              <User className="h-4 w-4 text-slate-500" />
              {employee.firstName} {employee.lastName}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <div className="flex items-center gap-2 text-white">
              <Mail className="h-4 w-4 text-slate-500" />
              {employee.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Employee Number</label>
            <div className="text-white">{employee.employeeNumber}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
            <div className="text-white">{employee.department || 'Not assigned'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Position</label>
            <div className="text-white">{employee.position}</div>
          </div>
        </div>
        
        {/* Editable fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
                placeholder="+1 234 567 890"
              />
            ) : (
              <div className="text-white">{employee.phone || 'Not set'}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Address
            </label>
            {isEditing ? (
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
                placeholder="Your address"
              />
            ) : (
              <div className="text-white">{employee.address || 'Not set'}</div>
            )}
          </div>
          
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Emergency Contact
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
                    placeholder="Emergency contact name"
                  />
                ) : (
                  <div className="text-white">{employee.emergencyContactName || 'Not set'}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white placeholder:text-slate-500"
                    placeholder="Emergency contact phone"
                  />
                ) : (
                  <div className="text-white">{employee.emergencyContactPhone || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
