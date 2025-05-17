import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session?.user || !(session.user as any).isAdmin) {
        redirect('/')
    }

    const product = await prisma.product.findUnique({
        where: { id: params.id }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Edit Product: {product.title}
                </h1>
            </div>
            <ProductForm
                initialData={{
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    downloadUrl: product.downloadUrl,
                }}
                isEditing={true}
            />
        </div>
    )
} 