import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

// Rate limiting storage: IP -> { count: number, timestamp: number }
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes in milliseconds
const MAX_ATTEMPTS = 5

function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }
    return 'unknown'
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record) {
        return true
    }

    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(ip)
        return true
    }

    return record.count < MAX_ATTEMPTS
}

function incrementRateLimit(ip: string): void {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
        return
    }

    record.count++
}

function clearRateLimit(ip: string): void {
    rateLimitMap.delete(ip)
}

export async function POST(request: Request) {
    const clientIP = getClientIP(request)

    if (!checkRateLimit(clientIP)) {
        return NextResponse.json(
            { error: 'Too many login attempts, please try again later' },
            { status: 429 }
        )
    }

    incrementRateLimit(clientIP)

    try {
        const { username, password } = await request.json()

        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
        }

        // sign JWT token
        const token = await signToken({ userId: user.id, username: user.username })

        clearRateLimit(clientIP)

        const response = NextResponse.json({ message: '登录成功' })

        // Set cookie
        response.cookies.set('limblog_session', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return response
    } catch (error) {
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
    }
}
