import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        // Basic auth check
        const cookieHeader = request.headers.get('cookie') || ''
        const match = cookieHeader.match(/limblog_session=([^;]+)/)
        if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = match[1]
        const payload = await verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Process file
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Create safe filename
        const ext = path.extname(file.name)
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '-')
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const filename = `${baseName}-${uniqueSuffix}${ext}`

        // Upload directory: public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')

        // Optional: make sure directory exists using fs or mcp_filesystem_create_directory in a real setup.
        // We'll rely on Prisma/Next or create it explicitly here if it's node env
        try {
            await require('fs').promises.mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore if exists
        }

        await writeFile(path.join(uploadDir, filename), buffer)

        const fileUrl = `/uploads/${filename}`

        return NextResponse.json({ url: fileUrl })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
