import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 获取所有站点配置
export async function GET() {
    try {
        const configs = await prisma.siteConfig.findMany()
        const result: Record<string, string> = {}
        for (const c of configs) {
            result[c.key] = c.value
        }
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({}, { status: 200 })
    }
}

// 批量更新站点配置
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json() as Record<string, string>

        for (const [key, value] of Object.entries(body)) {
            await prisma.siteConfig.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update site config:', error)
        return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }
}
