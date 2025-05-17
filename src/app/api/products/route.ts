import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, imageUrl, downloadUrl } = body

    try {
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price,
                imageUrl,
                downloadUrl,
            }
        })
        return NextResponse.json(product)
    } catch (error) {
        return new NextResponse('Error creating product', { status: 500 })
    }
} 