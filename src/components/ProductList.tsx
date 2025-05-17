'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmPurchaseModal from './ConfirmPurchaseModal'

type Product = {
    id: string
    title: string
    description: string
    price: number
    imageUrl: string
}

type ProductListProps = {
    products: Product[]
    isAuthenticated: boolean
}

export default function ProductList({ products, isAuthenticated }: ProductListProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handlePurchaseClick = (product: Product) => {
        if (!isAuthenticated) {
            window.location.href = '/login'
            return
        }
        setSelectedProduct(product)
        setIsModalOpen(true)
        setSuccess(null)
        setError(null)
    }

    const handlePurchaseConfirm = async () => {
        if (!selectedProduct) return

        try {
            setLoading(selectedProduct.id)
            setError(null)
            setSuccess(null)

            // First create checkout session
            const checkoutResponse = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: selectedProduct.id }),
            })

            const checkoutData = await checkoutResponse.json()

            if (!checkoutResponse.ok) {
                throw new Error(checkoutData.error || 'Failed to create checkout session')
            }

            // Then send email
            const emailResponse = await fetch('/api/send-purchase-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: selectedProduct.id }),
            })

            const emailData = await emailResponse.json()

            if (!emailResponse.ok) {
                throw new Error(emailData.error || 'Failed to send confirmation email')
            }

            // Close modal and show success message
            setIsModalOpen(false)
            setSuccess(`Successfully purchased ${selectedProduct.title}! Check your email for details.`)

            // Refresh the page after a short delay
            setTimeout(() => {
                router.refresh()
            }, 2000)

        } catch (err) {
            console.error('Purchase error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(null)
        }
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {success && (
                    <div className="mb-8 rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {success}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.map((product) => (
                        <div key={product.id} className="group relative">
                            <Link href={`/products/${product.id}`} className="block cursor-pointer">
                                <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                                        fill
                                        sizes="(min-width: 1280px) 384px, (min-width: 1024px) 288px, (min-width: 640px) 384px, 100vw"
                                        priority
                                    />
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                                            {product.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </p>
                                </div>
                            </Link>
                            <div className="mt-4">
                                <button
                                    onClick={() => handlePurchaseClick(product)}
                                    disabled={loading === product.id}
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                                >
                                    {loading === product.id ? 'Processing...' : isAuthenticated ? 'Buy Now' : 'Sign in to Buy'}
                                </button>
                            </div>
                            {error && loading === product.id && (
                                <p className="mt-2 text-sm text-red-600">{error}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <ConfirmPurchaseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handlePurchaseConfirm}
                    product={selectedProduct}
                    loading={loading === selectedProduct.id}
                />
            )}
        </>
    )
} 