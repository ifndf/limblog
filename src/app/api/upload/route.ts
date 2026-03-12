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
        const ext = path.extname(file.name).toLowerCase()
        const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff'].includes(ext)
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '-')
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        
        const uploadDir = path.join(process.cwd(), 'data', 'uploads')
        try {
            await require('fs').promises.mkdir(uploadDir, { recursive: true })
        } catch (e) {}

        let finalFilename = `${baseName}-${uniqueSuffix}${ext}`
        let finalBuffer = buffer

        if (isImage && ext !== '.gif') { // Skip gif compression for now to avoid complexity
            try {
                const sharp = require('sharp')
                finalBuffer = await sharp(buffer)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer()
                finalFilename = `${baseName}-${uniqueSuffix}.webp`
            } catch (err) {
                console.error('Sharp compression failed, falling back to original:', err)
            }
        }

        await writeFile(path.join(uploadDir, finalFilename), finalBuffer)
        const fileUrl = `/uploads/${finalFilename}`

        return NextResponse.json({ url: fileUrl })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
