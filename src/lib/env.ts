const requiredEnvVars = {
    auth: ['NEXTAUTH_SECRET'],
    database: ['DATABASE_URL'],
} as const

export function validateEnv(type: keyof typeof requiredEnvVars = 'auth') {
    const varsToCheck = requiredEnvVars[type]
    const missingVars = varsToCheck.filter(
        (envVar) => !process.env[envVar]
    )

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        )
    }

    // Validate NEXTAUTH_SECRET format and length if checking auth vars
    if (type === 'auth') {
        const secret = process.env.NEXTAUTH_SECRET
        if (!secret) {
            throw new Error('NEXTAUTH_SECRET is required')
        }

        if (secret.length < 32) {
            // In development, we can be more lenient
            if (process.env.NODE_ENV === 'production' && secret.length < 32) {
                throw new Error('NEXTAUTH_SECRET must be at least 32 characters long in production')
            }
        }

        // Set default NEXTAUTH_URL in development
        if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'development') {
            process.env.NEXTAUTH_URL = 'http://localhost:3000'
        }
    }

    // Validate DATABASE_URL format if checking database vars
    if (type === 'database') {
        const dbUrl = process.env.DATABASE_URL
        if (dbUrl && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('mysql://')) {
            throw new Error('DATABASE_URL must be a valid PostgreSQL or MySQL connection string')
        }
    }

    return true
}

export function isEnvValid(type: keyof typeof requiredEnvVars = 'auth'): boolean {
    try {
        return validateEnv(type)
    } catch (error) {
        console.error(`Environment validation failed for ${type}:`, error)
        return false
    }
} 