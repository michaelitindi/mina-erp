---
name: nextjs-prisma-production-safety
description: Automatically sanitize Prisma data (like Decimals) before passing it from Server Actions to Client Components to prevent Next.js production render crashes.
---

# Next.js Prisma Production Safety

Use this skill when returning data from Next.js Server Actions that include Prisma `Decimal` objects or other non-serializable types. Next.js production builds will crash with "Server Component Render" errors if these objects reach a Client Component.

## Core Workflow

1.  **Detect Return Type**: Identify the object or array being returned by the Server Action.
2.  **Import Utility**: Ensure `serializeDecimal` is imported from `@/lib/utils`.
3.  **Apply Serialization**: Wrap the return value in `serializeDecimal<T>(...)`.
4.  **Verify Generics**: Ensure the generic type `T` is preserved so TypeScript inference continues to work in the UI components.

## Implementation Example

```typescript
import { serializeDecimal } from '@/lib/utils'

export async function getMyData() {
  const data = await prisma.myModel.findMany()
  
  // WRONG: return data 
  // (Will work in dev, crash in prod)

  // CORRECT:
  return serializeDecimal(data)
}
```

## The Serialization Utility

This utility should live in `src/lib/utils.ts`:

```typescript
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'object' && (obj as any).constructor?.name === 'Decimal') {
    return Number(obj.toString()) as any
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal) as any
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const serialized: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = serializeDecimal((obj as any)[key])
      }
    }
    return serialized as T
  }
  return obj
}
```
