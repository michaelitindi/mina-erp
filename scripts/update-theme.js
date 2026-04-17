const fs = require('fs');
const path = require('path');

const files = [
  'src/app/(dashboard)/dashboard/crm/customers/page.tsx',
  'src/app/(dashboard)/dashboard/crm/leads/page.tsx',
  'src/app/(dashboard)/dashboard/crm/opportunities/page.tsx',
  'src/app/(dashboard)/dashboard/crm/vendors/page.tsx',
  'src/app/(dashboard)/dashboard/finance/accounts/page.tsx',
  'src/app/(dashboard)/dashboard/finance/bills/page.tsx',
  'src/app/(dashboard)/dashboard/finance/budgets/page.tsx',
  'src/app/(dashboard)/dashboard/finance/invoices/page.tsx',
  'src/app/(dashboard)/dashboard/finance/payments/page.tsx',
  'src/app/(dashboard)/dashboard/hr/employees/page.tsx',
  'src/app/(dashboard)/dashboard/hr/leave/page.tsx',
  'src/app/(dashboard)/dashboard/inventory/alerts/page.tsx',
  'src/app/(dashboard)/dashboard/inventory/products/page.tsx',
  'src/app/(dashboard)/dashboard/inventory/warehouses/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/attendance/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/bank/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/dependants/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/leaves/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/payslips/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/professional/page.tsx',
  'src/app/(dashboard)/dashboard/my-portal/resignation/page.tsx',
  'src/app/(dashboard)/dashboard/pos/sales/page.tsx',
  'src/app/(dashboard)/dashboard/pos/shifts/page.tsx',
  'src/app/(dashboard)/dashboard/procurement/purchase-orders/page.tsx',
  'src/app/(dashboard)/dashboard/sales/orders/page.tsx',
  'src/app/(dashboard)/dashboard/sales/shipments/page.tsx',
  'src/app/(dashboard)/dashboard/settings/payments/page.tsx'
];

const root = 'C:\\Users\\Mike\\OneDrive\\Desktop\\erp';

function mapColor(color, value) {
  const v = parseInt(value);
  if (v >= 900) return 950;
  if (v >= 100) return v + 100;
  return v;
}

files.forEach(file => {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove padding
  content = content.replace(/(return\s*\(\s*<div\s+className="[^"]*)\s+p-[68]\s*([^"]*")/g, '$1 $2');
  content = content.replace(/(return\s*\(\s*<div\s+className=")p-[68]\s+/g, '$1');
  content = content.replace(/(return\s*\(\s*<div\s+className="[^"]*)\s+p-[68]"/g, '$1"');

  // Universal slate to zinc replacement
  content = content.replace(/(text|bg|border|divide|hover:bg|placeholder:text|focus:border)-slate-(\d+)/g, (match, type, value) => {
    return `${type}-zinc-${mapColor(type, value)}`;
  });

  // Handle border-slate-700 or border-slate-800 specifically to border-zinc-800 as per instructions
  // (Our mapColor handles 700->800 and 800->900, but user said 800->800 too)
  // Let's refine the mapColor to match user instructions exactly
  
  // Specific instruction replacements (these take precedence)
  content = content.replace(/bg-zinc-950/g, 'bg-zinc-950'); // already there
  content = content.replace(/bg-slate-800\/50/g, 'bg-zinc-900/50');
  content = content.replace(/border-slate-800/g, 'border-zinc-800');
  content = content.replace(/border-slate-700/g, 'border-zinc-800');

  // Modernize UI: add shadow-sm and backdrop-blur-sm to rounded-xl containers
  content = content.replace(/(className="[^"]*rounded-xl border border-zinc-800[^"]*)"/g, (match, p1) => {
    let newClass = p1;
    if (!newClass.includes('shadow-sm')) newClass += ' shadow-sm';
    if (!newClass.includes('backdrop-blur-sm')) newClass += ' backdrop-blur-sm';
    return newClass + '"';
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${file}`);
});
