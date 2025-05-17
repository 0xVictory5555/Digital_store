import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import ProductList from '@/components/ProductList'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      imageUrl: true,
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Digital Products Marketplace
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover and purchase high-quality digital products
            </p>
            {!session && (
              <div className="mt-8">
                <p className="text-gray-600">
                  Please{' '}
                  <a href="/login" className="text-indigo-600 hover:text-indigo-500">
                    sign in
                  </a>
                  {' '}or{' '}
                  <a href="/signup" className="text-indigo-600 hover:text-indigo-500">
                    create an account
                  </a>
                  {' '}to purchase products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductList products={products} isAuthenticated={!!session} />
    </div>
  )
}
