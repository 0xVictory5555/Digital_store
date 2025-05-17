'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ProductFormData = {
    title: string
    description: string
    price: number
    imageUrl: string
    downloadUrl: string
}

type ProductFormProps = {
    initialData?: ProductFormData
    isEditing?: boolean
}

export default function ProductForm({ initialData, isEditing }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '')
    const [urlError, setUrlError] = useState<string | null>(null)

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setImagePreview(url)
        if (url && !validateUrl(url)) {
            setUrlError('Please enter a valid URL')
        } else {
            setUrlError(null)
        }
    }

    const handleDownloadUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        if (url && !validateUrl(url)) {
            setUrlError('Please enter a valid URL')
        } else {
            setUrlError(null)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            imageUrl: formData.get('imageUrl') as string,
            downloadUrl: formData.get('downloadUrl') as string,
        }

        if (!validateUrl(data.imageUrl) || !validateUrl(data.downloadUrl)) {
            setError('Please enter valid URLs for both image and download links')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/products' + (isEditing ? `/${initialData?.title}` : ''), {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to save product')
            }

            router.push('/admin')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!isEditing || !initialData?.title) return

        if (!confirm('Are you sure you want to delete this product?')) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/products/${initialData.title}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete product')
            }

            router.push('/admin')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    defaultValue={initialData?.title}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    required
                    defaultValue={initialData?.description}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                </label>
                <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={initialData?.price}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Image URL
                </label>
                <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    required
                    defaultValue={initialData?.imageUrl}
                    onChange={handleImageUrlChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {imagePreview && (
                    <div className="mt-2 relative w-32 h-32">
                        <Image
                            src={imagePreview}
                            alt="Product preview"
                            fill
                            className="object-cover rounded-lg"
                            onError={() => setImagePreview('')}
                        />
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700">
                    Download URL
                </label>
                <input
                    type="url"
                    name="downloadUrl"
                    id="downloadUrl"
                    required
                    defaultValue={initialData?.downloadUrl}
                    onChange={handleDownloadUrlChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            {(error || urlError) && (
                <div className="text-red-600 text-sm">
                    {error || urlError}
                </div>
            )}

            <div className="flex justify-between gap-4">
                {isEditing && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete Product
                    </button>
                )}
                <div className="flex gap-4 ml-auto">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !!urlError}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                    </button>
                </div>
            </div>
        </form>
    )
} 