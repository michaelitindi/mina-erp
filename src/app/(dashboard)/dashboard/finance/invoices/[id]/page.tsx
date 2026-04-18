import { getInvoice } from '@/app/actions/invoices'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Shield, CheckCircle2, QrCode, Globe } from 'lucide-react'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  
  if (!invoice) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/finance/invoices" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Link>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-all text-sm font-bold border border-zinc-700">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-600/20">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* KRA Compliance Header (Visible if validated) */}
        {invoice.isEtimsValidated && (
          <div className="bg-blue-600/10 border-b border-blue-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">KRA eTIMS Validated</p>
                <p className="text-sm font-mono text-white">{invoice.kraControlNumber}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Validation Date</p>
              <p className="text-sm text-zinc-300">{invoice.etimsValidatedAt ? new Date(invoice.etimsValidatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="p-8 md:p-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <span className="text-2xl font-black text-white">M</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">TAX INVOICE</h1>
                <p className="text-zinc-500 font-mono">{invoice.invoiceNumber}</p>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <p className="text-xl font-bold text-white">{invoice.organization.name}</p>
              <p className="text-zinc-400 text-sm">{invoice.organization.industry}</p>
              {invoice.organization.pinNumber && (
                <p className="text-xs font-mono text-zinc-500 mt-2">PIN: {invoice.organization.pinNumber}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 pb-12 border-b border-zinc-800">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Bill To</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-white">{invoice.customer.companyName}</p>
                <p className="text-zinc-400">{invoice.customer.email}</p>
                {invoice.customer.phone && <p className="text-zinc-400">{invoice.customer.phone}</p>}
                {invoice.customer.pinNumber && (
                  <p className="text-xs font-mono text-blue-400 mt-2 bg-blue-400/5 inline-block px-2 py-1 rounded">PIN: {invoice.customer.pinNumber}</p>
                )}
              </div>
            </div>
            
            <div className="md:text-right space-y-4">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex md:justify-end gap-8 text-sm">
                  <span className="text-zinc-500">Issue Date</span>
                  <span className="text-white font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div className="flex md:justify-end gap-8 text-sm">
                  <span className="text-zinc-500">Due Date</span>
                  <span className="text-white font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex md:justify-end gap-8 text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] px-2 py-1 bg-emerald-400/10 rounded border border-emerald-400/20">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="space-y-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800">
                  <th className="pb-4">Description</th>
                  <th className="pb-4 text-center">Qty</th>
                  <th className="pb-4 text-right">Unit Price</th>
                  <th className="pb-4 text-right">Tax (%)</th>
                  <th className="pb-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="py-6 text-white font-medium">{item.description}</td>
                    <td className="py-6 text-center text-zinc-300">{Number(item.quantity)}</td>
                    <td className="py-6 text-right text-zinc-300">${Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-6 text-right text-zinc-300">{Number(item.taxRate)}%</td>
                    <td className="py-6 text-right text-white font-bold">${Number(item.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary and QR */}
          <div className="flex flex-col md:flex-row justify-between gap-12 pt-8">
            <div className="flex-1 max-w-sm">
              {invoice.isEtimsValidated && invoice.kraQrCode && (
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-2xl w-32 h-32 flex items-center justify-center shadow-xl">
                    {/* In a real app, use a QR library, here we show a placeholder */}
                    <QrCode className="w-24 h-24 text-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Verification</p>
                    <p className="text-[9px] text-zinc-600 break-all font-mono leading-relaxed">{invoice.kraQrCode}</p>
                    <Link href={invoice.kraQrCode} target="_blank" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:underline font-bold uppercase mt-1">
                      <Globe className="h-3 w-3" /> Verify on iTax Portal
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-300 font-mono">${Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Tax Amount</span>
                <span className="text-zinc-300 font-mono">${Number(invoice.taxAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-white pt-4 border-t border-zinc-800">
                <span>TOTAL</span>
                <span className="font-mono">${Number(invoice.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500 pt-1">
                <span>Amount Paid</span>
                <span className="font-mono">-${Number(invoice.paidAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-400 pt-3 border-t border-blue-500/20">
                <span>Balance Due</span>
                <span className="font-mono">${(Number(invoice.totalAmount) - Number(invoice.paidAmount)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="pt-12 border-t border-zinc-800 text-sm">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Notes</h3>
              <p className="text-zinc-400 leading-relaxed italic">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
