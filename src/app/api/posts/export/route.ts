import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import JSZip from 'jszip'

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
        })

        const zip = new JSZip()

        for (const post of posts) {
            // 每篇文章生成带 frontmatter 的 .md 文件
            const frontmatter = [
                '---',
                `title: "${post.title.replace(/"/g, '\\"')}"`,
                `slug: "${post.slug}"`,
                `date: "${post.createdAt.toISOString()}"`,
                `published: ${post.published}`,
                '---',
                '',
            ].join('\n')

            const fileContent = frontmatter + post.content
            
            // 使用标题作为文件名，并过滤掉系统非法字符
            const safeTitle = post.title.replace(/[\\/:\*\?"<>\|]/g, '_').trim() || post.slug
            zip.file(`${safeTitle}.md`, fileContent)
        }

        const zipBlob = await zip.generateAsync({ type: 'arraybuffer' })

        return new NextResponse(zipBlob, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="limblog-export-${new Date().toISOString().split('T')[0]}.zip"`,
            },
        })
    } catch (error) {
        console.error('Export failed:', error)
        return NextResponse.json({ error: '导出失败' }, { status: 500 })
    }
}
