import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create admin user
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            isAdmin: true,
        },
    })

    // Create sample products
    const products = [
        {
            title: 'Digital Marketing Guide',
            description: 'Comprehensive guide to modern digital marketing strategies. Learn about SEO, social media marketing, content marketing, email campaigns, and more. Perfect for beginners and intermediate marketers.',
            price: 29.99,
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            downloadUrl: 'https://example.com/downloads/marketing-guide.pdf',
        },
        {
            title: 'Photography Masterclass',
            description: 'Learn professional photography techniques from basics to advanced concepts. Includes lessons on composition, lighting, post-processing, and building your photography business.',
            price: 49.99,
            imageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=800&q=80',
            downloadUrl: 'https://example.com/downloads/photography-course.zip',
        },
        {
            title: 'Web Development Course',
            description: 'Complete guide to modern web development. Covers HTML, CSS, JavaScript, React, Node.js, and database integration. Build real-world projects as you learn.',
            price: 79.99,
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            downloadUrl: 'https://example.com/downloads/webdev-course.zip',
        },
    ]

    for (const product of products) {
        await prisma.product.upsert({
            where: { title: product.title },
            update: product,
            create: product,
        })
    }

    console.log('Database has been seeded.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 