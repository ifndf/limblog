import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(posts)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, slug, contentBase64 } = body
        const content = contentBase64 ? Buffer.from(contentBase64, 'base64').toString('utf8') : body.content
        
        // 简单的服务端的 Slug 唯一性检查
        const existing = await prisma.post.findUnique({ where: { slug } })
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        }

        const post = await prisma.post.create({
            data: {
                title,
                content,
                slug
            }
        })
        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
