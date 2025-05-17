import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

// Export the handler as both GET and POST handlers
export const GET = handler
export const POST = handler 