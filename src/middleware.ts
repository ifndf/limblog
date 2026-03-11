import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protected routes list
    const isProtectedPath = pathname.startsWith('/new') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/api/upload') ||
        pathname.startsWith('/api/auth/settings') ||
        pathname.startsWith('/api/posts/export') ||
        pathname.startsWith('/api/posts/import') ||
        (pathname.startsWith('/api/posts') && request.method !== 'GET')

    if (isProtectedPath) {
        const sessionCookie = request.cookies.get('limblog_session')?.value

        if (!sessionCookie) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }

        const payload = await verifyToken(sessionCookie)

        if (!payload) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Token is valid, proceed
        return NextResponse.next()
    }

    // Handle logout
    if (pathname === '/api/auth/logout') {
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.delete('limblog_session')
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/new/:path*', '/settings/:path*', '/api/posts/:path*', '/api/upload/:path*', '/api/auth/logout', '/api/auth/settings']
}
