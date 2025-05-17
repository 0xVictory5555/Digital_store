import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import sgMail from '@sendgrid/mail'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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

        // Get product details
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Create order record
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                productId: product.id,
                status: 'completed',
            }
        })

        // Prepare email content
        const msg = {
            to: session.user.email,
            from: process.env.SENDGRID_FROM_EMAIL || 'your-verified-sender@example.com',
            subject: `Your Purchase: ${product.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #4F46E5;">Thank you for your purchase!</h1>
                    <p>Dear ${session.user.name || 'valued customer'},</p>
                    <p>Your purchase of <strong>${product.title}</strong> has been confirmed.</p>
                    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #374151; margin-top: 0;">Purchase Details:</h2>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin: 10px 0;"><strong>Product:</strong> ${product.title}</li>
                            <li style="margin: 10px 0;"><strong>Price:</strong> $${product.price.toFixed(2)}</li>
                            <li style="margin: 10px 0;"><strong>Order ID:</strong> ${order.id}</li>
                        </ul>
                    </div>
                    <p>You can download your product here:</p>
                    <p><a href="${product.downloadUrl}" style="color: #4F46E5; text-decoration: underline;">${product.downloadUrl}</a></p>
                    <p style="margin-top: 30px; color: #6B7280;">Thank you for shopping with us!</p>
                </div>
            `,
        }

        // Send email using SendGrid
        await sgMail.send(msg)

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (error) {
        console.error('Email sending error:', error)
        return NextResponse.json(
            { error: 'Failed to process purchase' },
            { status: 500 }
        )
    }
} 