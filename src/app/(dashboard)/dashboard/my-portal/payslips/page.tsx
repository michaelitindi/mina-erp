'use client'

import { useState, useEffect } from 'react'
import { getMyPayslips } from '@/app/actions/self-service'
import { Receipt, Download, DollarSign } from 'lucide-react'

type Payslip = {
  id: string
  payPeriodStart: Date
  payPeriodEnd: Date
  baseSalary: { toString: () => string }
  bonus: { toString: () => string }
  deductions: { toString: () => string }
  taxWithheld: { toString: () => string }
  netPay: { toString: () => string }
  currency: string
  paidAt: Date | null
}

export default function PayslipsPage() {
  const [loading, setLoading] = useState(true)
  const [payslips, setPayslips] = useState<Payslip[]>([])
  
  useEffect(() => {
    getMyPayslips().then((data) => {
      setPayslips(data)
      setLoading(false)
    })
  }, [])
  
  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">My Payslips</h2>
      </div>
      
      <p className="text-sm text-slate-400">
        View your salary history and download payslips.
      </p>
      
      {payslips.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No payslips available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((slip) => (
            <div key={slip.id} className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">
                    {new Date(slip.payPeriodStart).toLocaleDateString()} - {new Date(slip.payPeriodEnd).toLocaleDateString()}
                  </div>
                  {slip.paidAt && (
                    <div className="text-xs text-slate-500">
                      Paid on {new Date(slip.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <div className="text-slate-400">Base Salary</div>
                  <div className="text-white">{slip.currency} {parseFloat(slip.baseSalary.toString()).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Bonus</div>
                  <div className="text-green-400">+{slip.currency} {parseFloat(slip.bonus.toString()).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Deductions</div>
                  <div className="text-red-400">-{slip.currency} {parseFloat(slip.deductions.toString()).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Tax</div>
                  <div className="text-red-400">-{slip.currency} {parseFloat(slip.taxWithheld.toString()).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Net Pay</div>
                  <div className="text-emerald-400 font-semibold">{slip.currency} {parseFloat(slip.netPay.toString()).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
