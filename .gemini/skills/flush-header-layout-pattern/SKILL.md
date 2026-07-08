---
name: flush-header-layout-pattern
description: Standardize professional "Flush-Top" dashboard layouts in Next.js by removing global main padding and delegating it to pages, enabling seamless sticky sub-navigation.
---

# Flush-Header Layout Pattern

Use this skill when building new dashboard modules or pages in MinaERP to ensure a professional, "Flush-Top" hierarchy where secondary navigation bars sit perfectly against the primary header.

## Core Principle

Never use global padding on the `main` tag if your pages use sticky sub-navigation. Global padding "squeezes" the sub-nav, creating an unprofessional "floating" look and potential overlaps.

## The Implementation SOP

### 1. Clean the Dashboard Shell
- Ensure the `DashboardShell` (usually in `src/components/shared/dashboard-shell.tsx`) has **no padding** on the `main` tag.
- Set the `main` tag to `flex-1 min-h-0 overflow-y-auto`.

### 2. Position the Module Navigation
- Use the `ModuleNav` component for sub-module menus.
- Set its positioning to `sticky top-0 z-20 w-full`.
- Use a high-opacity background with backdrop-blur (e.g., `bg-zinc-950/95 backdrop-blur-md`) to perfectly obscure content scrolling underneath.

### 3. Delegate Padding to Pages
- Manually apply padding to every top-level container in your `page.tsx` or `layout.tsx`.
- Use the standard pattern: `<div className="p-4 md:p-6">...</div>`.
- For pages with a `ModuleNav`, apply the padding to the container holding the `{children}`, NOT the layout wrapper.

## Code Pattern Example

```typescript
// Correct Layout with ModuleNav
export default function MyModuleLayout({ children }) {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleNav moduleName="My Module" items={items} />
      <div className="flex-1 p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
```
