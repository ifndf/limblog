import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params
    const filePath = path.join(process.cwd(), 'data', 'uploads', filename)

    try {
        const fileBuffer = await readFile(filePath)
        
        // Determine content type based on extension
        const ext = path.extname(filename).toLowerCase()
        let contentType = 'application/octet-stream'
        
        if (ext === '.png') contentType = 'image/png'
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        else if (ext === '.gif') contentType = 'image/gif'
        else if (ext === '.svg') contentType = 'image/svg+xml'
        else if (ext === '.webp') contentType = 'image/webp'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        return new NextResponse('File not found', { status: 404 })
    }
}
