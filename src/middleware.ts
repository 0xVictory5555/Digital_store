import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isEnvValid } from '@/lib/env'

export async function middleware(request: NextRequest) {
    try {
        // Skip validation for static files and images
        if (
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.startsWith('/static') ||
            request.nextUrl.pathname.startsWith('/images') ||
            request.nextUrl.pathname.startsWith('/favicon.ico')
        ) {
            return NextResponse.next()
        }

        // In development, be more lenient with validation
        if (process.env.NODE_ENV === 'development') {
            return NextResponse.next()
        }

        // Check if it's an auth-related route
        if (request.nextUrl.pathname.startsWith('/api/auth')) {
            if (!isEnvValid('auth')) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Authentication not configured',
                        message: 'Please set the NEXTAUTH_SECRET environment variable',
                    }),
                    {
                        status: 503,
                        headers: { 'content-type': 'application/json' },
                    }
                )
            }
        }

        // Check if it's a database-related route
        if (
            request.nextUrl.pathname.startsWith('/api') &&
            !request.nextUrl.pathname.startsWith('/api/auth')
        ) {
            if (!isEnvValid('database')) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Database not configured',
                        message: 'Please set the DATABASE_URL environment variable',
                    }),
                    {
                        status: 503,
                        headers: { 'content-type': 'application/json' },
                    }
                )
            }
        }

        return NextResponse.next()
    } catch (err: any) {
        console.error('Middleware error:', err)

        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development'
                    ? err.message
                    : 'An unexpected error occurred',
            }),
            {
                status: 500,
                headers: { 'content-type': 'application/json' },
            }
        )
    }
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 