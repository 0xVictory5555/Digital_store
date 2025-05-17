import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'

// Generate a default secret for development
const generateDefaultSecret = () => {
    if (process.env.NODE_ENV !== 'production') {
        return 'development_secret_at_least_32_characters_long'
    }
    return process.env.NEXTAUTH_SECRET
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
    secret: generateDefaultSecret(),
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