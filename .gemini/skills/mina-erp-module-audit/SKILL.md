---
name: mina-erp-module-audit
description: A systematic procedure for auditing and upgrading MinaERP modules to enterprise grade, covering schema relations, KRA/eTIMS compliance, transactional integrity, and dynamic detail hubs.
---

# MinaERP Module Audit & Upgrade SOP

Use this skill when starting work on a new or existing MinaERP module (e.g., Inventory, HR, Assets) to ensure it meets production-ready enterprise standards.

## The Audit Workflow

### 1. Schema & Relation Mapping
- Audit the `prisma/schema.prisma` for the module's core models.
- Ensure all line items (e.g., `SalesItem`, `DeliveryItem`) are explicitly linked to the `Product` model via `productId`.
- Verify back-relations exist so the "Command Center" pages can show linked data.

### 2. Compliance Injection (KRA/eTIMS)
- Identify where local regulations apply.
- Ensure `pinNumber` exists on all relevant entity models (Lead, Customer, Vendor).
- Add the `pinNumber` field to all creation/edit forms with a "Kenya Compliance" label.
- Map PIN data during conversion processes (e.g., Lead -> Customer).

### 3. Transactional Integrity
- Identify critical business transitions (Confirming an Order, Posting an Invoice).
- Implement these transitions using `prisma.$transaction` to ensure absolute data integrity.
- Use specialized logic engines like `reserveStock` or `postToLedger` to keep actions lean and maintainable.

### 4. Detail Hub Hub Creation
- Transition from simple table views to dynamic `[id]` pages.
- Create dynamic routes (e.g., `src/app/(dashboard)/dashboard/module/[id]/page.tsx`).
- Implement a "Command Center" layout with specialized status management buttons.

### 5. zinc Theme Consistency
- Strictly apply the Zinc palette (`bg-zinc-950`, `border-zinc-800`, `bg-zinc-900/50`).
- Use high-density data tables and professional-grade typography.
- Ensure 100% mobile-responsiveness using `p-4 md:p-6` padding patterns.

## Audit Checklist
- [ ] Are all product-related line items linked to `Product`?
- [ ] Does the creation form capture the KRA PIN?
- [ ] Is stock reserved/deducted using a transaction?
- [ ] Does a detailed `[id]` page exist for the entity?
- [ ] Is the "Flush-Header" layout pattern applied?
