import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE() {
    try {
        const result = await prisma.post.deleteMany({})
        return NextResponse.json({ deleted: result.count })
    } catch (error) {
        return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }
}
