import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { productId } = await req.json()

        const product = await prisma.product.findUnique({
            where: { id: productId },
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // For demo purposes, we'll create a mock checkout URL
        // In production, you would integrate with Coinbase Commerce API here
        const mockCheckoutUrl = `http://localhost:3000/checkout/success?productId=${productId}`

        // Create an order
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                productId: product.id,
                status: 'pending',
                paymentId: 'mock-payment-id',
            },
        })

        return NextResponse.json({ url: mockCheckoutUrl })
    } catch (error) {
        console.error('Error creating checkout:', error)
        return NextResponse.json(
            { error: 'Error creating checkout' },
            { status: 500 }
        )
    }
} 