import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createWebsite,
  generateWebsiteWithAI,
  submitWebForm
} from '@/app/actions/website-builder'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// Mock sub-methods of prisma used in actions
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(() => Promise.resolve({ id: 'org-id', clerkOrgId: 'test-org' })),
      create: vi.fn(),
    },
    website: {
      create: vi.fn((args) => Promise.resolve({ id: 'web-123', ...args.data })),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    webPage: {
      create: vi.fn((args) => Promise.resolve({ id: 'page-123', ...args.data })),
    },
    formSubmission: {
      create: vi.fn((args) => Promise.resolve({ id: 'sub-123', ...args.data })),
    },
    webCourse: {
      create: vi.fn((args) => Promise.resolve({ id: 'course-123', ...args.data })),
    }
  }
}))

describe('Website Builder Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default auth mock behavior
    vi.mocked(auth).mockResolvedValue({
      userId: 'user-123',
      orgId: 'org-123',
      orgRole: 'org:admin'
    } as any)
  })

  describe('createWebsite', () => {
    it('should create website with default pages and settings', async () => {
      const input = {
        name: 'Test Academy',
        slug: 'test-academy',
        type: 'SCHOOL' as const,
        primaryColor: '#1E3A8A',
        secondaryColor: '#D97706',
        fontFamily: 'outfit'
      }

      const website = await createWebsite(input)
      expect(website).toBeDefined()
      expect(website.name).toBe('Test Academy')
      expect(website.slug).toBe('test-academy')
      expect(website.type).toBe('SCHOOL')
    })
  })

  describe('generateWebsiteWithAI', () => {
    it('should fall back to high-fidelity mock templates when key is missing', async () => {
      const prompt = 'A digital school with classes'
      const type = 'SCHOOL' as const

      const website = await generateWebsiteWithAI(prompt, type)
      expect(website).toBeDefined()
      expect(website.name).toContain('digital school')
      expect(website.type).toBe('SCHOOL')
    })

    it('should support educational courses generation when type is COURSE', async () => {
      const prompt = 'Fullstack bootcamp platform'
      const type = 'COURSE' as const

      const website = await generateWebsiteWithAI(prompt, type)
      expect(website).toBeDefined()
      expect(website.type).toBe('COURSE')
      expect(website.primaryColor).toBe('#7C3AED')
    })
  })

  describe('submitWebForm', () => {
    it('should record submissions with payload correctly', async () => {
      const payload = JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
      const sub = await submitWebForm('web-123', 'CONTACT', payload)
      
      expect(sub).toBeDefined()
      expect(sub.websiteId).toBe('web-123')
      expect(sub.formType).toBe('CONTACT')
      expect(sub.payload).toBe(payload)
    })
  })
})
