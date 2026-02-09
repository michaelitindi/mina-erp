#!/usr/bin/env node
/**
 * Database Backup Script
 * Creates timestamped PostgreSQL backups with retention policy
 * 
 * Usage:
 *   npx ts-node scripts/backup-db.ts
 *   npm run db:backup
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   BACKUP_DIR - Directory for backups (default: ./backups)
 *   BACKUP_RETENTION_DAYS - Days to keep backups (default: 30)
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const DATABASE_URL = process.env.DATABASE_URL
const BACKUP_DIR = process.env.BACKUP_DIR || './backups'
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10)

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function error(message: string) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
}

function parseConnectionString(url: string) {
  const regex = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  const match = url.match(regex)
  if (!match) throw new Error('Invalid DATABASE_URL format')
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5].split('?')[0], // Remove query params
  }
}

function createBackup() {
  if (!DATABASE_URL) {
    error('DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
    log(`Created backup directory: ${BACKUP_DIR}`)
  }

  const db = parseConnectionString(DATABASE_URL)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `backup-${db.database}-${timestamp}.sql`
  const filepath = path.join(BACKUP_DIR, filename)
  const compressedPath = `${filepath}.gz`

  log(`Starting backup of database: ${db.database}`)
  log(`Backup file: ${compressedPath}`)

  try {
    // Set password in environment for pg_dump
    const env = { ...process.env, PGPASSWORD: db.password }

    // Run pg_dump and compress
    execSync(
      `pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F p | gzip > "${compressedPath}"`,
      { env, stdio: 'inherit' }
    )

    const stats = fs.statSync(compressedPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    log(`Backup completed successfully! Size: ${sizeMB} MB`)

    return compressedPath
  } catch (err) {
    error(`Backup failed: ${err}`)
    process.exit(1)
  }
}

function cleanupOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return

  const now = Date.now()
  const cutoffMs = RETENTION_DAYS * 24 * 60 * 60 * 1000

  log(`Cleaning up backups older than ${RETENTION_DAYS} days...`)

  const files = fs.readdirSync(BACKUP_DIR)
  let deleted = 0

  for (const file of files) {
    if (!file.startsWith('backup-') || !file.endsWith('.sql.gz')) continue

    const filepath = path.join(BACKUP_DIR, file)
    const stats = fs.statSync(filepath)
    const age = now - stats.mtime.getTime()

    if (age > cutoffMs) {
      fs.unlinkSync(filepath)
      log(`Deleted old backup: ${file}`)
      deleted++
    }
  }

  log(`Cleanup complete. Deleted ${deleted} old backup(s).`)
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    log('No backups found.')
    return []
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.sql.gz'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f))
      return {
        name: f,
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        created: stats.mtime.toISOString(),
      }
    })
    .sort((a, b) => b.created.localeCompare(a.created))

  log(`Found ${files.length} backup(s):`)
  files.forEach(f => console.log(`  - ${f.name} (${f.size}, ${f.created})`))

  return files
}

// Main execution
const command = process.argv[2] || 'backup'

switch (command) {
  case 'backup':
    createBackup()
    cleanupOldBackups()
    break
  case 'list':
    listBackups()
    break
  case 'cleanup':
    cleanupOldBackups()
    break
  default:
    console.log(`
Database Backup Script

Commands:
  backup   - Create a new backup and cleanup old ones (default)
  list     - List existing backups
  cleanup  - Remove backups older than retention period

Examples:
  npx ts-node scripts/backup-db.ts
  npx ts-node scripts/backup-db.ts list
  npx ts-node scripts/backup-db.ts cleanup
`)
}
