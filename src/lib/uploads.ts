/**
 * File Upload Utility
 * Handles file uploads to local storage or cloud providers
 * Can be configured to use AWS S3, CloudFlare R2, or local filesystem
 */

import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// Upload provider type
type UploadProvider = 'local' | 's3' | 'r2'

const UPLOAD_PROVIDER = (process.env.UPLOAD_PROVIDER || 'local') as UploadProvider
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) // 10MB default

// Allowed file types by category
export const allowedFileTypes = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
}

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  filename?: string
  size?: number
  mimeType?: string
  error?: string
}

export interface UploadOptions {
  allowedTypes?: string[]
  maxSize?: number
  folder?: string
}

/**
 * Validate file before upload
 */
function validateFile(
  file: File,
  options: UploadOptions = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || MAX_FILE_SIZE
  const allowedTypes = options.allowedTypes || allowedFileTypes.all

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` }
  }

  return { valid: true }
}

/**
 * Generate a unique filename
 */
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const uuid = randomUUID()
  return `${uuid}${ext}`
}

/**
 * Upload to local filesystem
 */
async function uploadLocal(
  file: File,
  folder: string = 'general'
): Promise<UploadResult> {
  const uploadPath = path.join(UPLOAD_DIR, folder)
  
  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }

  const filename = generateFilename(file.name)
  const filepath = path.join(uploadPath, filename)
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filepath, buffer)
    
    return {
      success: true,
      url: `/uploads/${folder}/${filename}`,
      key: `${folder}/${filename}`,
      filename,
      size: file.size,
      mimeType: file.type,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to save file: ${error}`,
    }
  }
}

/**
 * Upload to S3/R2 (placeholder - implement with your provider)
 */
async function uploadToCloud(
  file: File,
  folder: string = 'general',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider: 's3' | 'r2'
): Promise<UploadResult> {
  // TODO: Implement S3/R2 upload
  // const s3 = new S3Client({ ... })
  // await s3.send(new PutObjectCommand({ ... }))
  
  console.warn('Cloud upload not implemented, falling back to local')
  return uploadLocal(file, folder)
}

/**
 * Main upload function
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Validate
  const validation = validateFile(file, options)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const folder = options.folder || 'general'

  // Upload based on provider
  switch (UPLOAD_PROVIDER) {
    case 's3':
      return uploadToCloud(file, folder, 's3')
    case 'r2':
      return uploadToCloud(file, folder, 'r2')
    case 'local':
    default:
      return uploadLocal(file, folder)
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  return Promise.all(files.map(file => uploadFile(file, options)))
}

/**
 * Delete a file by key
 */
export async function deleteFile(key: string): Promise<boolean> {
  if (UPLOAD_PROVIDER === 'local') {
    const filepath = path.join(UPLOAD_DIR, key)
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
        return true
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }
  // TODO: Implement cloud deletion
  return false
}

/**
 * Get file URL
 */
export function getFileUrl(key: string): string {
  if (UPLOAD_PROVIDER === 'local') {
    return `/uploads/${key}`
  }
  // For cloud, would return signed URL or public URL
  return `/uploads/${key}`
}
