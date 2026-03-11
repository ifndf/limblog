import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import JSZip from 'jszip'
import { getSession } from '@/lib/auth'
import { slugify } from 'transliteration'

// 解析 frontmatter
function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
    const meta: Record<string, string> = {}
    let body = content

    // 兼容 \r\n 换行符
    const normalized = content.replace(/\r\n/g, '\n')

    if (normalized.startsWith('---')) {
        const endIndex = normalized.indexOf('\n---', 3)
        if (endIndex !== -1) {
            const frontmatter = normalized.substring(3, endIndex).trim()
            body = normalized.substring(endIndex + 4).trim()

            for (const line of frontmatter.split('\n')) {
                // 只在第一个冒号处分割（避免 date 中的冒号被错误分割）
                const colonIndex = line.indexOf(':')
                if (colonIndex !== -1) {
                    const key = line.substring(0, colonIndex).trim()
                    let value = line.substring(colonIndex + 1).trim()
                    // 去除引号
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1)
                    }
                    meta[key] = value
                }
            }
        }
    }

    return { meta, body }
}

// 从文件名中提取基础名 (去路径、去扩展名)
function getBasename(filepath: string): string {
    // 兼容 / 和 \ 路径分隔符
    const parts = filepath.replace(/\\/g, '/').split('/')
    const filename = parts[parts.length - 1]
    return filename.replace(/\.md$/i, '')
}

// 生成安全的 slug
function makeSafeSlug(text: string): string {
    return slugify(text, { lowercase: true, separator: '-' }) || `post-${Date.now()}`
}

async function importSingleMd(
    content: string,
    filepath: string,
    results: { imported: number; skipped: number; errors: string[] }
) {
    const { meta, body } = parseFrontmatter(content)

    if (!body || body.trim().length === 0) {
        results.skipped++
        results.errors.push(`跳过 "${filepath}": 内容为空`)
        return
    }

    const basename = getBasename(filepath)
    const title = meta.title || basename.replace(/-/g, ' ')
    const slug = meta.slug || makeSafeSlug(basename)
    const dateStr = meta.date
    const createdAt = dateStr ? new Date(dateStr) : new Date()

    // 检查 slug 是否已存在
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) {
        results.skipped++
        results.errors.push(`跳过 "${title}": slug "${slug}" 已存在`)
        return
    }

    await prisma.post.create({
        data: {
            title,
            slug,
            content: body,
            createdAt,
        },
    })
    results.imported++
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: '未授权' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 })
        }

        const results = { imported: 0, skipped: 0, errors: [] as string[] }

        if (file.name.endsWith('.zip')) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const zip = await JSZip.loadAsync(buffer)

            const mdFiles = Object.entries(zip.files).filter(
                ([name, zipEntry]) => name.endsWith('.md') && !zipEntry.dir
            )

            for (const [filename, zipEntry] of mdFiles) {
                try {
                    const content = await zipEntry.async('string')
                    await importSingleMd(content, filename, results)
                } catch (err: any) {
                    results.errors.push(`导入 "${filename}" 失败: ${err.message}`)
                }
            }
        } else if (file.name.endsWith('.md')) {
            try {
                const content = await file.text()
                await importSingleMd(content, file.name, results)
            } catch (err: any) {
                results.errors.push(`导入 "${file.name}" 失败: ${err.message}`)
            }
        } else {
            return NextResponse.json({ error: '仅支持 .zip 或 .md 文件' }, { status: 400 })
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error('Import failed:', error)
        return NextResponse.json({ error: '导入失败' }, { status: 500 })
    }
}
