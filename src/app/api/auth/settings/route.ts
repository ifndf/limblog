import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const match = cookieHeader.match(/limblog_session=([^;]+)/)
        if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = match[1]
        const payload = await verifyToken(token)
        if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { username, password } = await request.json()

        if (!username && !password) {
            return NextResponse.json({ error: '没有提供需要更新的数据' }, { status: 400 })
        }

        const dataToUpdate: any = {}

        if (username) {
            dataToUpdate.username = username
        }

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10)
        }

        await prisma.user.update({
            where: { id: payload.userId as string },
            data: dataToUpdate
        })

        const response = NextResponse.json({ message: '凭据更新成功' })

        // 如果修改了密码，推荐强制退登，或者这里为简单起见我们可以选择不清空 session
        // 如果你想让会话立即失效，可以：
        // response.cookies.delete('limblog_session')

        return response
    } catch (error) {
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: '用户名已存在' }, { status: 400 })
        }
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
    }
}
