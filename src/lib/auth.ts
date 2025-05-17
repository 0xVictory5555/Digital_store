import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'

// Ensure required environment variables are set
const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const
const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
)

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
    )
}

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string | null
            isAdmin: boolean
        }
    }

    interface User {
        id: string
        email: string
        name: string | null
        isAdmin: boolean
    }
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: 'Sign in',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials.password) {
                        throw new Error('Please enter your email and password')
                    }

                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    })

                    if (!user) {
                        throw new Error('No user found with this email')
                    }

                    const isPasswordValid = await compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        throw new Error('Invalid password')
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        isAdmin: user.isAdmin,
                    }
                } catch (error: any) {
                    console.error('Authentication error:', error)
                    throw error
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.isAdmin = user.isAdmin
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string | null,
                    isAdmin: token.isAdmin as boolean,
                }
            }
            return session
        }
    },
    debug: process.env.NODE_ENV === 'development',
}