import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    const duration = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'ok',
          responseTime: `${duration}ms`,
        },
      },
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    const duration = Date.now() - start

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: 'error',
            responseTime: `${duration}ms`,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
      { status: 503 }
    )
  }
}
