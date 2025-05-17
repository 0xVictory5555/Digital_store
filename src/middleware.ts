import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isEnvValid } from '@/lib/env'

// Type guard for NODE_ENV
const isDevelopment = () => process.env.NODE_ENV === 'development'

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
        if (isDevelopment()) {
            return NextResponse.next()
        }

        // Check if it's an auth-related route
        if (request.nextUrl.pathname.startsWith('/api/auth')) {
            if (!process.env.NEXTAUTH_SECRET) {
                console.error('NEXTAUTH_SECRET is not configured')
                const response = {
                    error: 'Authentication not configured',
                    message: 'The authentication service is not properly configured. Please contact support if this issue persists.',
                }

                if (isDevelopment()) {
                    Object.assign(response, {
                        details: 'NEXTAUTH_SECRET environment variable is missing'
                    })
                }

                return new NextResponse(JSON.stringify(response), {
                    status: 503,
                    headers: { 'content-type': 'application/json' },
                })
            }

            if (!isEnvValid('auth')) {
                const response = {
                    error: 'Authentication configuration incomplete',
                    message: 'The authentication service is not properly configured. Please contact support if this issue persists.',
                }

                if (isDevelopment()) {
                    Object.assign(response, {
                        details: 'Some required environment variables are missing'
                    })
                }

                return new NextResponse(JSON.stringify(response), {
                    status: 503,
                    headers: { 'content-type': 'application/json' },
                })
            }
        }

        // Check if it's a database-related route
        if (
            request.nextUrl.pathname.startsWith('/api') &&
            !request.nextUrl.pathname.startsWith('/api/auth')
        ) {
            if (!isEnvValid('database')) {
                const response = {
                    error: 'Database not configured',
                    message: 'The database service is not properly configured. Please contact support if this issue persists.',
                }

                if (isDevelopment()) {
                    Object.assign(response, {
                        details: 'DATABASE_URL environment variable is missing or invalid'
                    })
                }

                return new NextResponse(JSON.stringify(response), {
                    status: 503,
                    headers: { 'content-type': 'application/json' },
                })
            }
        }

        return NextResponse.next()
    } catch (err: any) {
        console.error('Middleware error:', err)

        const response = {
            error: 'Internal server error',
            message: 'An unexpected error occurred. Please try again later.',
        }

        if (isDevelopment()) {
            Object.assign(response, {
                details: err.message
            })
        }

        return new NextResponse(JSON.stringify(response), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        })
    }
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 