/**
 * Universal Data Export Utility for MinaERP
 * Handles client-side CSV downloads and PDF printing/exporting.
 */

/**
 * Exports an array of objects or key-value rows to a downloadable CSV file.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header]
          if (val === null || val === undefined) return '""'
          const escaped = String(val).replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(',')
    )
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Triggers clean PDF print layout export for a DOM element.
 */
export function printElementToPDF(title: string): void {
  if (typeof window !== 'undefined') {
    const originalTitle = document.title
    document.title = title
    window.print()
    document.title = originalTitle
  }
}
