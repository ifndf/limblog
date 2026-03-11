'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LogoutButton() {
    const router = useRouter()
    const [lang, setLang] = useState('zh')

    useEffect(() => {
        const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/)
        if (match) {
            setLang(match[2])
        }
    }, [])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-neutral-600 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 relative top-px"
        >
            Logout
        </button>
    )
}
