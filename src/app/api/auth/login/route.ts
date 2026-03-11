import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
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
