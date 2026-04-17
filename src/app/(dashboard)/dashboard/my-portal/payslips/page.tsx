'use client'

import { useState, useEffect } from 'react'
import { getMyPayslips } from '@/app/actions/self-service'
import { Receipt, Download, DollarSign, Calendar } from 'lucide-react'

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
    return <div className="text-zinc-500">Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">My Payslips</h2>
      </div>
      
      <p className="text-sm text-zinc-500">
        View your salary history and download payslips.
      </p>
      
      {payslips.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No payslips available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((slip) => (
            <div key={slip.id} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all shadow-sm group">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800/50">
                <div>
                  <div className="text-white font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    {new Date(slip.payPeriodStart).toLocaleDateString()} - {new Date(slip.payPeriodEnd).toLocaleDateString()}
                  </div>
                  {slip.paidAt && (
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">
                      Paid on {new Date(slip.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Base Salary</p>
                  <p className="text-sm font-bold text-white">{slip.currency} {parseFloat(slip.baseSalary.toString()).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Bonus</p>
                  <p className="text-sm font-bold text-green-400">+{slip.currency} {parseFloat(slip.bonus.toString()).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Deductions</p>
                  <p className="text-sm font-bold text-red-400">-{slip.currency} {parseFloat(slip.deductions.toString()).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Tax</p>
                  <p className="text-sm font-bold text-red-400">-{slip.currency} {parseFloat(slip.taxWithheld.toString()).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-600/10 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-500/70 uppercase font-black tracking-tighter mb-1">Net Pay</p>
                  <p className="text-lg font-black text-emerald-400">{slip.currency} {parseFloat(slip.netPay.toString()).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
