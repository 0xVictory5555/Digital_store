import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import BuyButton from './BuyButton'

export default async function ProductPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Back to Products
                    </Link>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image */}
                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                        <Image
                            src={product.imageUrl}
                            alt={product.title}
                            className="object-cover"
                            fill
                            priority
                            sizes="(min-width: 1024px) 50vw, 100vw"
                        />
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {product.title}
                        </h1>

                        <div className="mt-3">
                            <p className="text-3xl text-gray-900">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                {product.description}
                            </div>
                        </div>

                        <div className="mt-8">
                            <BuyButton
                                product={product}
                                isAuthenticated={!!session}
                            />
                        </div>

                        {/* Additional Details */}
                        <div className="mt-10">
                            <h3 className="text-sm font-medium text-gray-900">
                                What's included
                            </h3>
                            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                                    <li>Instant digital download</li>
                                    <li>Full lifetime access</li>
                                    <li>Email support</li>
                                    <li>Regular updates</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 