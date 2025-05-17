import { PrismaClient } from '../generated/prisma'

declare global {
    var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
    })
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Ensure the Prisma Client can connect to the database
prisma.$connect()
    .then(() => {
        console.log('Database connection established')
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error)
        process.exit(1)
    }) 