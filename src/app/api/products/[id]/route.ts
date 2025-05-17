import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id }
        })

        if (!product) {
            return new NextResponse('Product not found', { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        return new NextResponse('Error fetching product', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, imageUrl, downloadUrl } = body

    try {
        const product = await prisma.product.update({
            where: { id: params.id },
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
        return new NextResponse('Error updating product', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        await prisma.product.delete({
            where: { id: params.id }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return new NextResponse('Error deleting product', { status: 500 })
    }
} 