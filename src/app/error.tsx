'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Something went wrong!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We're sorry, but there was an error processing your request.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-4 rounded-md text-left">
                        <p className="font-semibold">Error details:</p>
                        <p className="mt-2 font-mono break-all">{error.message}</p>
                        {error.digest && (
                            <p className="mt-2 font-mono text-xs">Digest: {error.digest}</p>
                        )}
                    </div>
                )}

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => reset()}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        </div>
    )
} 