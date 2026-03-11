import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ message: '登出成功' })
    response.cookies.delete('limblog_session')
    return response
}
