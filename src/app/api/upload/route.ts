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

        // MIME type whitelist validation
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP' },
                { status: 400 }
            )
        }

        // File size limit (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Magic bytes validation for additional security
        const magicBytes: Record<string, number[]> = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/gif': [0x47, 0x49, 0x46, 0x38],
            // WebP: RIFF header + WEBP at offset 8
        }

        const expectedMagic = magicBytes[file.type]
        if (expectedMagic) {
            const isMatch = expectedMagic.every((byte, i) => buffer[i] === byte)
            if (!isMatch) {
                return NextResponse.json(
                    { error: 'File content does not match declared MIME type' },
                    { status: 400 }
                )
            }
        }

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
