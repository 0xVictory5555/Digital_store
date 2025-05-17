import { PrismaClient } from '../generated/prisma'

declare global {
    var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
    }).$extends({
        query: {
            async $allOperations({ operation, args, query }) {
                try {
                    return await query(args)
                } catch (error: any) {
                    console.error(`Database ${operation} error:`, error)

                    // Check if it's a connection error
                    if (error.code === 'P1001' || error.code === 'P1002') {
                        throw new Error('Unable to connect to the database')
                    }

                    throw error
                }
            },
        },
    })
}

if (process.env.NODE_ENV !== 'production') {
    if (!global.prisma) {
        global.prisma = prismaClientSingleton()
    }
}

export const prisma = global.prisma || prismaClientSingleton()

// Warm up the database connection
prisma.$connect()
    .then(() => {
        console.log('Database connection established')
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error)
        // Don't exit in production, let the request handler deal with it
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1)
        }
    }) 