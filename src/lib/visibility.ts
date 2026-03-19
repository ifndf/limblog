import prisma from '@/lib/prisma'
import { getSession } from './auth'
import { notFound } from 'next/navigation'

export async function checkVisibility() {
    const session = await getSession()
    if (session) return // Admin can always see

    const config = await prisma.siteConfig.findUnique({ where: { key: 'site_visibility' } })
    if (config?.value === 'private') {
        notFound()
    }
}
