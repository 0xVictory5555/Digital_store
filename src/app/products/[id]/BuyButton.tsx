'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmPurchaseModal from '@/components/ConfirmPurchaseModal'

type Product = {
    id: string
    title: string
    price: number
}

type BuyButtonProps = {
    product: Product
    isAuthenticated: boolean
}

export default function BuyButton({ product, isAuthenticated }: BuyButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handlePurchaseClick = () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setIsModalOpen(true)
        setError(null)
    }

    const handlePurchaseConfirm = async () => {
        try {
            setLoading(true)
            setError(null)

            // First create checkout session
            const checkoutResponse = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: product.id }),
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
                body: JSON.stringify({ productId: product.id }),
            })

            const emailData = await emailResponse.json()

            if (!emailResponse.ok) {
                throw new Error(emailData.error || 'Failed to send confirmation email')
            }

            // Close modal and redirect to success page
            setIsModalOpen(false)
            router.push('/?success=true')
            router.refresh()

        } catch (err) {
            console.error('Purchase error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button
                onClick={handlePurchaseClick}
                disabled={loading}
                className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
                {loading ? 'Processing...' : isAuthenticated ? 'Buy Now' : 'Sign in to Buy'}
            </button>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            <ConfirmPurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handlePurchaseConfirm}
                product={product}
                loading={loading}
            />
        </div>
    )
} 