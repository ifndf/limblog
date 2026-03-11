import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    try {
        const post = await prisma.post.findUnique({
            where: { slug }
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    try {
        const { title, content, slug: newSlug } = await request.json()

        const post = await prisma.post.findUnique({ where: { slug } })
        if (!post) {
            return NextResponse.json({ error: '文章不存在' }, { status: 404 })
        }

        // 如果修改了 slug，检查新 slug 是否冲突
        if (newSlug && newSlug !== slug) {
            const existing = await prisma.post.findUnique({ where: { slug: newSlug } })
            if (existing) {
                return NextResponse.json({ error: '该固定链接已被使用' }, { status: 400 })
            }
        }

        const updated = await prisma.post.update({
            where: { slug },
            data: {
                title: title || post.title,
                content: content !== undefined ? content : post.content,
                slug: newSlug || slug,
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    try {
        const post = await prisma.post.findUnique({ where: { slug } })
        if (!post) {
            return NextResponse.json({ error: '文章不存在' }, { status: 404 })
        }

        await prisma.post.delete({ where: { slug } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }
}
