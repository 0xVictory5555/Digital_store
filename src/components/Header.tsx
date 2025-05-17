'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header() {
    const { data: session } = useSession()

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-gray-900">
                        Digital Store
                    </Link>
                    <div>
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/admin"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Admin Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
} 